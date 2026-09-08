const fs = require('fs');
const path = require('path');
const https = require('https');
const { Telegraf, Markup } = require('telegraf');
const config = require('./config/config');
const gestorPermisos = require('./database/gestorPermisos');

// Validar que el token exista
if (!config.token) {
  console.error('Error: BOT_TOKEN no está definido en el archivo .env');
  process.exit(1);
}

// Agente HTTPS para solucionar bloqueos de red o ECONNRESET
const agent = new https.Agent({
  keepAlive: true,
  family: 4
});

const bot = new Telegraf(config.token, {
  telegram: { agent }
});

// Captura global de errores no controlados en middlewares
bot.catch((err, ctx) => {
  console.error(`❌ Error en el middleware para el evento ${ctx.updateType}:`, err);
});

const commands = new Map();

// Carga recursiva con asignación automática de permisos según subcarpeta
function cargarComandos(dir) {
  if (!fs.existsSync(dir)) return;

  const archivos = fs.readdirSync(dir);

  for (const archivo of archivos) {
    const rutaAbsoluta = path.join(dir, archivo);
    const stat = fs.statSync(rutaAbsoluta);

    if (stat.isDirectory()) {
      cargarComandos(rutaAbsoluta);
    } else if (archivo.endsWith('.js')) {
      const comando = require(rutaAbsoluta);
      
      // Si el archivo está dentro de una carpeta '/admin/' (compatible con Windows y Linux)
      const rutaNormalizada = path.normalize(rutaAbsoluta);
      const esAdmin = rutaNormalizada.includes(`${path.sep}admin${path.sep}`);
      
      if (comando.name && typeof comando.execute === 'function') {
        commands.set(comando.name.toLowerCase(), {
          ...comando,
          isAdminOnly: esAdmin
        });
        console.log(`[Cargado] Comando: /${comando.name} | Exclusivo Admin: ${esAdmin}`);
      }
    }
  }
}

// Cargar todos los comandos de la carpeta /comandos
cargarComandos(path.join(__dirname, 'comandos'));

// Registra los comandos directamente para LuxBot con ámbitos explícitos
async function registrarComandosTelegram() {
  try {
    const listaComandosMenu = [];

    for (const [nombre, cmd] of commands.entries()) {
      // Registra en el menú sugerido únicamente los comandos públicos o de usuario
      if (!cmd.isAdminOnly) {
        listaComandosMenu.push({
          command: nombre,
          description: cmd.description || 'Ejecutar comando'
        });
      }
    }

    if (listaComandosMenu.length > 0) {
      // Configura los comandos globales para tu bot
      await bot.telegram.setMyCommands(listaComandosMenu, {
        scope: { type: 'default' }
      });

      // Configura los comandos para chats grupales
      await bot.telegram.setMyCommands(listaComandosMenu, {
        scope: { type: 'all_group_chats' }
      });

      console.log('✅ Comandos registrados exitosamente en el menú nativo de Telegram.');
    }
  } catch (err) {
    console.error('❌ Error registrando comandos en el menú de Telegram:', err.message);
  }
}

// Evento: Nuevo usuario entra al grupo (Mensaje de Bienvenida con Prefix Dinámico)
// Evento: Nuevo usuario entra al grupo (Mensaje de Bienvenida con Prefix Dinámico y Botones)
bot.on('new_chat_members', async (ctx) => {
  try {
    const chat = ctx.chat;
    const currentPrefix = gestorPermisos.obtenerPrefix(chat.id);
    const nuevosMiembros = ctx.message.new_chat_members;

    for (const miembro of nuevosMiembros) {
      if (miembro.is_bot) continue;

      const nombreUsuario = miembro.username ? `@${miembro.username}` : miembro.first_name;
      const userId = miembro.id;

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
        `  ${currentPrefix}stock ➔ Ver precios y disponibilidad\n` +
        `  ${currentPrefix}pago ➔ Métodos de pago disponibles\n` +
        `  ${currentPrefix}combos ➔ Mira los combos disponibles\n` +
        `  ${currentPrefix}lotes ➔ Precios especiales en compras por lote\n\n` +
        `¡Disfruta del mejor entretenimiento con la calidad y confianza de LUXPASS!`;

      // Botones adjuntos
      const botones = Markup.inlineKeyboard([
        [Markup.button.url('Canal De Referencias', 'https://t.me/@LuxPassRF')],
        [Markup.button.url('Grupo De WhatsApp', 'https://chat.whatsapp.com/FiymE5FOePQLjgka7qs4ZM')]
      ]);

      await ctx.reply(mensajeBienvenida, botones).catch(err => console.error('Error enviando bienvenida:', err.message));
    }
  } catch (error) {
    console.error('Error en evento new_chat_members:', error);
  }
});

// Middleware de ejecución y validación de roles (Acepta 'text' y 'photo')
bot.on(['text', 'photo'], async (ctx) => {
  try {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const username = ctx.from.username || '';
    
    // Extrae el texto del mensaje o la leyenda/caption de una imagen
    const texto = ctx.message.text ? ctx.message.text.trim() : (ctx.message.caption ? ctx.message.caption.trim() : '');

    gestorPermisos.actualizarInfoAdmin(userId, username);

    const currentPrefix = gestorPermisos.obtenerPrefix(chatId);

    if (!texto.startsWith(currentPrefix)) return;

    // Quita el prefijo
    const sinPrefijo = texto.slice(currentPrefix.length).trim();
    const partes = sinPrefijo.split(/ +/);
    let rawCommand = partes.shift().toLowerCase();

    // Separa el nombre del comando y la mención @bot (si existe)
    let [commandName, botMention] = rawCommand.split('@');

    // Ignora si el mensaje fue dirigido a otro bot de forma explícita
    if (botMention && ctx.botInfo && botMention !== ctx.botInfo.username.toLowerCase()) {
      return;
    }

    let args = partes;

    // Detectar si el comando empieza con "set" pegado (ej. setcombos, setpagos, setstock)
    if (commandName.startsWith('set') && commandName.length > 3) {
      const subComando = commandName.slice(3); // Extrae lo que va después de "set" (ej. "combos")
      commandName = 'set';                     // Reasigna para ejecutar el archivo set.js
      args.unshift(subComando);                // Agrega el subcomando al inicio de los argumentos
    }

    // 1. Buscar en la colección de comandos (.js)
    const comando = commands.get(commandName);

    if (comando) {
      if (comando.isAdminOnly && !gestorPermisos.esAdmin(userId, username)) {
        return ctx.reply('⚠️ No tienes permisos de administrador del bot para usar este comando.');
      }

      try {
        return await comando.execute(ctx, args, currentPrefix);
      } catch (error) {
        console.error(`Error al ejecutar /${commandName}:`, error);
        return ctx.reply('Ocurrió un error al ejecutar la instrucción.');
      }
    }

    // 2. Si no es un comando .js, buscar si el grupo tiene información guardada con setinfo
    const infoGuardada = gestorPermisos.obtenerComandoGrupo(chatId, commandName);
    if (infoGuardada) {
      return ctx.reply(infoGuardada, { parse_mode: 'Markdown' });
    }
  } catch (error) {
    console.error('Error en middleware de mensajes:', error);
  }
});

// Función para iniciar el bot con reintentos en caso de fallos de red
function iniciarBot() {
  bot.launch()
    .then(() => {
      console.log('🤖 Bot de Telegram en funcionamiento.');
      registrarComandosTelegram();
    })
    .catch((err) => {
      console.error('❌ Error de conexión al iniciar el bot:', err.message);
      console.log('Reintentando conexión en 5 segundos...');
      setTimeout(iniciarBot, 5000);
    });
}

iniciarBot();

// Manejo de apagado limpio del proceso
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));