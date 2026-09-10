const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'comandos',
  description: 'Muestra todos los comandos disponibles para los usuarios',
  async execute(ctx, args, prefix) {
    const chatId = ctx.chat.id;

    // 1. Obtener los comandos .js de comandos/usuarios/
    const carpetaUsuarios = __dirname;
    const archivosComandos = fs.readdirSync(carpetaUsuarios);

    const comandosBase = [];
    for (const archivo of archivosComandos) {
      if (archivo.endsWith('.js')) {
        const cmd = require(path.join(carpetaUsuarios, archivo));
        if (cmd.name) {
          comandosBase.push(`• \`${prefix}${cmd.name}\`${cmd.description ? ` - ${cmd.description}` : ''}`);
        }
      }
    }

    // 2. Leer los comandos dinámicos desde database/comandos.json
    let comandosDinamicos = [];
    const rutaCmdJson = path.join(__dirname, '../../database/comandos.json');

    if (fs.existsSync(rutaCmdJson)) {
      try {
        const dataCmds = JSON.parse(fs.readFileSync(rutaCmdJson, 'utf-8'));
        
        // Al ser un Array [...], buscamos el elemento que coincida con el group_id actual
        if (Array.isArray(dataCmds)) {
          const grupoEncontrado = dataCmds.find(g => String(g.group_id) === String(chatId));
          if (grupoEncontrado && grupoEncontrado.comandos) {
            comandosDinamicos = Object.keys(grupoEncontrado.comandos).map(cmd => `• \`${prefix}${cmd}\``);
          }
        }
      } catch (e) {
        console.error('Error al leer comandos.json:', e);
      }
    }

    // 3. Construir mensaje
    let lista = `📜 **LISTA DE COMANDOS DISPONIBLES**\n───────────────────\n\n`;

    if (comandosBase.length > 0) {
      lista += `⚙️ **Comandos del Bot:**\n` + comandosBase.join('\n') + `\n\n`;
    }

    if (comandosDinamicos.length > 0) {
      lista += `📌 **Comandos de Información:**\n` + comandosDinamicos.join('\n') + `\n\n`;
    }

    lista += `───────────────────\nUsa el prefijo \`${prefix}\` antes de cada comando.`;

    return ctx.reply(lista, { parse_mode: 'Markdown' });
  }
};
