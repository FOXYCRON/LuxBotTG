const gestorPermisos = require('../../database/gestorPermisos');

module.exports = {
  name: 'set',
  description: 'Establece o actualiza la información de un comando para este grupo',
  async execute(ctx, args, prefix) {
    if (ctx.chat.type === 'private') {
      return ctx.reply('⚠️ Este comando solo se puede utilizar dentro de un grupo.');
    }

    if (!args[0]) {
      return ctx.reply(
        '⚠️ Uso del comando:\n' +
        `• **Escribiendo el texto:** \`${prefix}set <nombre> Texto aquí...\` o \`${prefix}set<nombre> Texto...\`\n` +
        `• **Respondiendo a un mensaje:** Responde al mensaje y escribe \`${prefix}set <nombre>\` o \`${prefix}set<nombre>\``,
        { parse_mode: 'Markdown' }
      );
    }

    // Extrae el nombre del comando objetivo (ej. "combos", "pagos", "stock")
    const nombreComando = args.shift().toLowerCase();
    
    // Texto enviado directamente en el mensaje del comando
    let contenido = args.join(' ').trim();

    // Si no se envió texto junto al comando, lee el mensaje al que se está respondiendo
    if (!contenido && ctx.message.reply_to_message) {
      const replyMsg = ctx.message.reply_to_message;
      contenido = replyMsg.text || replyMsg.caption || '';
    }

    if (!contenido) {
      return ctx.reply(
        '⚠️ Debes escribir el contenido del comando o responder a un mensaje que tenga texto/leyenda.',
        { parse_mode: 'Markdown' }
      );
    }

    const tituloGrupo = ctx.chat.title || 'Grupo sin título';

    // Guarda el nuevo comando en la base de datos del grupo
    const guardado = gestorPermisos.guardarComandoGrupo(ctx.chat.id, tituloGrupo, nombreComando, contenido);

    if (guardado) {
      return ctx.reply(`✅ El comando \`${prefix}${nombreComando}\` ha sido guardado exitosamente para este grupo.`, { parse_mode: 'Markdown' });
    } else {
      return ctx.reply('⚠️ Ocurrió un error al guardar el comando.');
    }
  }
};