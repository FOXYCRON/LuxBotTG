const fs = require('fs');
const path = require('path');

const rutaContador = path.join(__dirname, '../../database/contadorRefs.json');

module.exports = {
  name: 'refnum',
  description: 'Ajusta manualmente el número de la siguiente referencia',
  isAdminOnly: true,
  execute(ctx, args, prefix) {
    if (!args[0] || isNaN(args[0])) {
      return ctx.reply(`⚠️ Uso correcto: \`${prefix}refnum 40\``, { parse_mode: 'Markdown' });
    }

    const nuevoNumero = parseInt(args[0], 10);

    try {
      fs.writeFileSync(rutaContador, JSON.stringify({ total: nuevoNumero }, null, 2));
      return ctx.reply(`✅ El contador de referencias se actualizó. La siguiente referencia será la **#${String(nuevoNumero).padStart(2, '0')}**.`, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error('Error al guardar contadorRefs.json:', e);
      return ctx.reply('❌ Ocurrió un error al intentar actualizar el contador.');
    }
  }
};