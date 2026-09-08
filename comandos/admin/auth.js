const gestorPermisos = require('../../database/gestorPermisos');

module.exports = {
  name: 'auth',
  description: 'Agrega a un nuevo administrador a la base de datos',
  execute(ctx, args, prefix) {
    let targetUserId = null;
    let targetUsername = null;

    // Método 1: Si se ejecuta respondiendo al mensaje de alguien
    if (ctx.message.reply_to_message) {
      const replyUser = ctx.message.reply_to_message.from;
      targetUserId = replyUser.id;
      targetUsername = replyUser.username || null;
    } 
    // Método 2 o 3: Si se pasa un argumento (ID o @username)
    else if (args.length > 0) {
      const input = args[0].trim();
      
      if (!isNaN(input)) {
        // Es un ID numérico
        targetUserId = parseInt(input, 10);
      } else {
        // Es un username (@LioTDH)
        targetUsername = input.replace('@', '');
      }
    } else {
      return ctx.reply(
        '⚠️ Uso del comando:\n' +
        `• Responde al mensaje de alguien: \`${prefix}addadmin\`\n` +
        `• Por Username: \`${prefix}addadmin @usuario\`\n` +
        `• Por ID: \`${prefix}addadmin 12345678\``,
        { parse_mode: 'Markdown' }
      );
    }

    const agregado = gestorPermisos.agregarAdmin(targetUserId, targetUsername);

    if (agregado) {
      const tag = targetUsername ? `@${targetUsername}` : `ID: ${targetUserId}`;
      return ctx.reply(`✅ El usuario **${tag}** ha sido agregado como administrador del bot.`, { parse_mode: 'Markdown' });
    } else {
      return ctx.reply('⚠️ Este usuario ya se encuentra registrado como administrador.');
    }
  }
};