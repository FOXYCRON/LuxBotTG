module.exports = {
  name: 'testwelcome',
  description: 'Prueba la bienvenida en el chat actual',
  execute(ctx, args, prefix) {
    const chat = ctx.chat;
    const nombreUsuario = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const userId = ctx.from.id;

    const mensajeBienvenida = 
      `✨ ¡BIENVENIDO/A A LUXPASS! ✨\n\n` +
      `👤 Usuario: ${nombreUsuario}\n` +
      `🆔 Tu ID: ${userId}\n` +
      `👥 Grupo: ${chat.title || 'LuxPass'}\n\n` +
      `───────────────────\n` +
      `🎬 CATÁLOGO DE SERVICIOS\n\n` +
      `Streaming:\n` +
      `• Netflix | Disney+ | Max | Prime | VIX+\n` +
      `• Crunchyroll | Apple TV+ | Canva Pro\n\n` +
      `Música:\n` +
      `• Spotify | YouTube Premium | Apple Music | Deezer\n\n` +
      `TV & Multimedia:\n` +
      `• IPTV | Películas | Series\n` +
      `───────────────────\n` +
      `📌 COMANDOS ÚTILES:\n` +
      `  ${prefix}stock ➔ Ver precios y disponibilidad\n` +
      `  ${prefix}pago ➔ Métodos de pago disponibles\n` +
      `  ${prefix}combos ➔ Mira los combos disponibles\n` +
      `  ${prefix}lotes ➔ Precios especiales en compras por lote\n\n` +
      `¡Disfruta del mejor entretenimiento con la calidad y confianza de LUXPASS!`;

    ctx.reply(mensajeBienvenida);
  }
};