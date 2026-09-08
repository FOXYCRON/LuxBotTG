module.exports = {
  name: 'start',
  description: 'Muestra el mensaje de bienvenida y catálogo',
  execute(ctx, prefix) {
    // Obtenemos los datos del usuario que envía el mensaje
    const usuario = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;
    const userId = ctx.from.id;

    const mensaje = `✨ ¡BIENVENIDO/A A LUXPASS! ✨\n\n` +
      `👤 Usuario: ${usuario}\n` +
      `🆔 Tu ID: ${userId}\n` +
      `👥 Grupo: LuxPass\n\n` +
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
      `  /stock ➔ Ver precios y disponibilidad\n` +
      `  /pago ➔ Métodos de pago disponibles\n` +
      `  /combos ➔ Mira los combos disponibles\n` +
      `  /lotes ➔ Precios especiales en compras por lote\n\n` +
      `¡Disfruta del mejor entretenimiento con la calidad y confianza de LUXPASS!`;

    return ctx.reply(mensaje);
  }
};