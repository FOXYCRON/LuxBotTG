const gestorPermisos = require('../../database/gestorPermisos');

module.exports = {
  name: 'delinfo',
  description: 'Elimina un comando personalizado del grupo',
  execute(ctx, args, prefix) {
    if (ctx.chat.type === 'private') {
      return ctx.reply('⚠️ Este comando solo se puede usar dentro de un grupo.');
    }

    if (!args[0]) {
      return ctx.reply(`⚠️ Indica el nombre del comando a eliminar. Ejemplo: \`${prefix}delinfo stock\``);
    }

    const nombreComando = args[0].toLowerCase();
    const eliminado = gestorPermisos.eliminarComandoGrupo(ctx.chat.id, nombreComando);

    if (eliminado) {
      return ctx.reply(`🗑️ El comando \`${prefix}${nombreComando}\` fue eliminado de este grupo.`, { parse_mode: 'Markdown' });
    } else {
      return ctx.reply('⚠️ Ese comando no existía o el grupo no está registrado.');
    }
  }
};