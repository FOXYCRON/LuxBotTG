const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'admin',
  description: 'Muestra el panel de comandos exclusivos para administradores',
  isAdminOnly: true,
  async execute(ctx, args, prefix) {
    const carpetaAdmin = path.join(__dirname, '../../comandos/admin');

    if (!fs.existsSync(carpetaAdmin)) {
      return ctx.reply('⚠️ No se encontró la carpeta de comandos administrativos.');
    }

    const archivosAdmin = fs.readdirSync(carpetaAdmin);
    const comandosAdmin = [];

    for (const archivo of archivosAdmin) {
      if (archivo.endsWith('.js')) {
        const cmd = require(path.join(carpetaAdmin, archivo));
        if (cmd.name) {
          comandosAdmin.push(`• \`${prefix}${cmd.name}\`${cmd.description ? ` - ${cmd.description}` : ''}`);
        }
      }
    }

    let lista = `👑 **PANEL DE ADMINISTRACIÓN**\n───────────────────\n\n`;

    if (comandosAdmin.length > 0) {
      lista += comandosAdmin.join('\n') + `\n\n`;
    } else {
      lista += `No hay comandos de administración registrados.\n\n`;
    }

    lista += `───────────────────\n*Comandos restringidos exclusivamente para administradores del bot.*`;

    return ctx.reply(lista, { parse_mode: 'Markdown' });
  }
};