const gestorPermisos = require('../../database/gestorPermisos');

module.exports = {
  name: 'addgrupo',
  description: 'Autoriza y registra un grupo en la base de datos',
  execute(ctx, args, prefix) {
    let groupId = null;
    let titulo = '';

    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
      groupId = ctx.chat.id;
      titulo = ctx.chat.title || 'Grupo sin título';
    } 
    else if (args.length > 0 && !isNaN(args[0])) {
      groupId = parseInt(args[0], 10);
      titulo = `Grupo (${groupId})`;
    } 
    else {
      return ctx.reply(
        '⚠️ Uso del comando:\n' +
        `• En un grupo: ${prefix}addgrupo\n` +
        `• Por ID: ${prefix}addgrupo -100xxxxxxxxxx`
      );
    }

    const yaEstaRegistrado = gestorPermisos.esGrupoPermitido(groupId);

    if (yaEstaRegistrado) {
      return ctx.reply(
        `ℹ️ El grupo "${titulo}" (ID: ${groupId}) ya está registrado y activo.`,
        { parse_mode: 'Markdown' }
      );
    }

    const registrado = gestorPermisos.registrarGrupo(groupId, titulo);

    if (registrado) {
      return ctx.reply(
        `✅ El grupo "${titulo}" ha sido registrado y autorizado con éxito.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      return ctx.reply('❌ No se pudo registrar el grupo.');
    }
  }
};