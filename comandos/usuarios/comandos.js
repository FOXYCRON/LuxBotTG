const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'comandos',
  description: 'Muestra todos los comandos disponibles para los usuarios',
  async execute(ctx, args, prefix) {
    const chatId = ctx.chat.id;

    // 1. Cargar comandos .js locales de la carpeta actual (usuarios)
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

    // 2. Resolver la ruta absoluta a database/comandos.json
    const rutaCmdJson = path.resolve(__dirname, '../../database/comandos.json');
    const comandosDinamicosSet = new Set();

    if (fs.existsSync(rutaCmdJson)) {
      try {
        const contenidoRaw = fs.readFileSync(rutaCmdJson, 'utf-8');
        const dataCmds = JSON.parse(contenidoRaw);

        if (Array.isArray(dataCmds)) {
          // Buscar primero si existen comandos específicos para este chat
          const grupoEspecifico = dataCmds.find(g => String(g.group_id) === String(chatId));

          if (grupoEspecifico && grupoEspecifico.comandos) {
            Object.keys(grupoEspecifico.comandos).forEach(cmd => comandosDinamicosSet.add(cmd));
          } else {
            // Si se ejecuta en privado o en un chat sin registro exclusivo, recolecta todos los comandos dinámicos existentes
            dataCmds.forEach(grupo => {
              if (grupo.comandos && typeof grupo.comandos === 'object') {
                Object.keys(grupo.comandos).forEach(cmd => comandosDinamicosSet.add(cmd));
              }
            });
          }
        }
      } catch (e) {
        console.error('❌ Error al leer comandos.json:', e.message);
      }
    }

    const comandosDinamicos = Array.from(comandosDinamicosSet).map(cmd => `• \`${prefix}${cmd}\``);

    // 3. Construir mensaje final
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
