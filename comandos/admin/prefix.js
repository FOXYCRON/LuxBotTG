const gestorPermisos = require('../../database/gestorPermisos');

module.exports = {
  name: 'prefix',
  description: 'Cambia el prefijo de comandos para este grupo',
  execute(ctx, args) {
    if (ctx.chat.type === 'private') {
      return ctx.reply('⚠️ Este comando solo se puede usar dentro de un grupo.');
    }

    if (!args[0]) {
      return ctx.reply('⚠️ Por favor indica el nuevo prefijo. Ejemplo: `g.prefix !`');
    }

    const nuevoPrefix = args[0].trim();
    const actualizado = gestorPermisos.actualizarPrefixGrupo(ctx.chat.id, nuevoPrefix);

    if (actualizado) {
      return ctx.reply(`✅ El prefijo para este grupo ha sido cambiado a: \`${nuevoPrefix}\``);
    } else {
      return ctx.reply('⚠️ Este grupo no está registrado en la base de datos del bot.');
    }
  }
};