module.exports = {
  name: 'ban',
  description: 'Comando exclusivo para administradores',
  execute(ctx, args, prefix) {
    return ctx.reply('🔨 Comando de administración ejecutado.');
  }
};