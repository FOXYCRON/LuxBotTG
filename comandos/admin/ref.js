const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');
const config = require('../../config/config');

const rutaContador = path.join(__dirname, '../../database/contadorRefs.json');

function obtenerYActualizarContador() {
  let contador = 35; // Valor base si no existe el archivo

  if (fs.existsSync(rutaContador)) {
    try {
      const data = JSON.parse(fs.readFileSync(rutaContador, 'utf-8'));
      if (typeof data.total === 'number') {
        contador = data.total;
      }
    } catch (e) {
      console.error('Error al leer contadorRefs.json:', e);
    }
  }

  const numFormateado = String(contador).padStart(2, '0');

  // Guardar el número siguiente para la próxima publicación
  fs.writeFileSync(rutaContador, JSON.stringify({ total: contador + 1 }, null, 2));

  return `#${numFormateado}`;
}

module.exports = {
  name: 'ref',
  description: 'Publica una referencia numerada sin necesidad de anclar mensajes',
  isAdminOnly: true,
  async execute(ctx, args, prefix) {
    let photoId = null;
    let mensajeTexto = '';
    let clienteUser = null;

    if (ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
      const photos = ctx.message.reply_to_message.photo;
      photoId = photos[photos.length - 1].file_id;
      mensajeTexto = args.join(' ') || ctx.message.reply_to_message.caption || '';
    } else if (ctx.message.photo) {
      const photos = ctx.message.photo;
      photoId = photos[photos.length - 1].file_id;
      mensajeTexto = args.join(' ');
    } else if (args.length > 0) {
      mensajeTexto = args.join(' ');
    } else {
      return ctx.reply(
        '⚠️ **Uso del comando:**\n' +
        `• Con foto: Responde a una foto con \`${prefix}ref @cliente Mensaje\`\n` +
        `• Solo texto: Escribe \`${prefix}ref @cliente Mensaje\``,
        { parse_mode: 'Markdown' }
      );
    }

    const emisor = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

    const mencion = args.find(a => a.startsWith('@'));
    if (mencion) {
      clienteUser = mencion;
      mensajeTexto = args.filter(a => !a.startsWith('@')).join(' ');
    } else if (ctx.message.reply_to_message && ctx.message.reply_to_message.from) {
      const replyUser = ctx.message.reply_to_message.from;
      clienteUser = replyUser.username ? `@${replyUser.username}` : replyUser.first_name;
    } else {
      clienteUser = emisor;
    }

    if (!mensajeTexto.trim()) mensajeTexto = 'Compra realizada con éxito';

    // Obtener número de venta actual
    const numVenta = obtenerYActualizarContador();

    const ahora = new Date();
    const fechaHora = ahora.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Hermosillo'
    });

    const plantillaRef = 
`✅ **¡Nueva Referencia ${numVenta}!**
───────────────────
┌ **Enviada por:** ${emisor}
├ **Referencia de:** ${clienteUser}
├ **Fecha/ Hora:** ${fechaHora}
└ **Mensaje:** ${mensajeTexto}
───────────────────
『 **LUXPASS BOT** 』`;

    const botones = Markup.inlineKeyboard([
      [
        Markup.button.url('💳 Comprar', 'https://t.me/LioTDH'),
        Markup.button.url('✅ Referencias', 'https://t.me/LuxPassGP')
      ]
    ]);

    try {
      if (photoId) {
        await ctx.telegram.sendPhoto(config.canalReferencias, photoId, {
          caption: plantillaRef,
          parse_mode: 'Markdown',
          ...botones
        });
      } else {
        await ctx.telegram.sendMessage(config.canalReferencias, plantillaRef, {
          parse_mode: 'Markdown',
          ...botones
        });
      }

      return ctx.reply(`✅ **Referencia ${numVenta} publicada exitosamente.**`, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error al publicar referencia:', error);
      return ctx.reply('❌ No se pudo publicar la referencia. Verifica la configuración del canal.');
    }
  }
};