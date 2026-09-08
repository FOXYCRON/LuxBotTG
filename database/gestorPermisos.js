const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const rutaAdmins = path.join(__dirname, 'authorized_users.json');
const rutaGrupos = path.join(__dirname, 'grupos.json');
const rutaComandos = path.join(__dirname, 'comandos.json');

function leerJSON(ruta) {
  if (!fs.existsSync(ruta)) {
    fs.writeFileSync(ruta, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(ruta, 'utf-8');
    // Si el archivo está completamente vacío o solo contiene espacios, retorna un array vacío
    if (!data || data.trim() === '') {
      fs.writeFileSync(ruta, JSON.stringify([], null, 2));
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error al leer ${ruta}:`, error);
    return [];
  }
}

function guardarJSON(ruta, datos) {
  try {
    fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));
  } catch (error) {
    console.error(`Error al guardar en ${ruta}:`, error);
  }
}

// Caché de grupos en memoria
let gruposCache = leerJSON(rutaGrupos);
let comandosCache = leerJSON(rutaComandos);

module.exports = {
  esAdmin(userId, username = '') {
    if (userId && config.adminIds.includes(userId)) return true;

    const admins = leerJSON(rutaAdmins);
    const cleanUsername = username ? username.replace('@', '').toLowerCase() : '';

    return admins.some(admin => {
      const matchId = userId && admin.user_id && admin.user_id === userId;
      const matchUser = cleanUsername && admin.username && admin.username.toLowerCase() === cleanUsername;
      return matchId || matchUser;
    });
  },

  agregarAdmin(userId, username = '') {
    const admins = leerJSON(rutaAdmins);
    const cleanUsername = username ? username.replace('@', '') : null;

    const existe = admins.some(admin => 
      (userId && admin.user_id === userId) || 
      (cleanUsername && admin.username && admin.username.toLowerCase() === cleanUsername.toLowerCase())
    );

    if (!existe) {
      admins.push({
        user_id: userId || null,
        username: cleanUsername,
        registrado_en: new Date().toISOString()
      });
      guardarJSON(rutaAdmins, admins);
      return true;
    }
    return false;
  },

  actualizarInfoAdmin(userId, username) {
    if (!userId || !username) return;
    
    const admins = leerJSON(rutaAdmins);
    const cleanUsername = username.replace('@', '').toLowerCase();
    let modificado = false;

    for (const admin of admins) {
      if (admin.username && admin.username.toLowerCase() === cleanUsername && !admin.user_id) {
        admin.user_id = userId;
        modificado = true;
      }
    }

    if (modificado) {
      guardarJSON(rutaAdmins, admins);
    }
  },

  quitarAdmin(identificador) {
    let admins = leerJSON(rutaAdmins);
    const inicialLen = admins.length;
    const cleanId = typeof identificador === 'string' ? identificador.replace('@', '').toLowerCase() : identificador;

    admins = admins.filter(admin => {
      if (typeof cleanId === 'number') {
        return admin.user_id !== cleanId;
      }
      return admin.username && admin.username.toLowerCase() !== cleanId;
    });

    if (admins.length !== inicialLen) {
      guardarJSON(rutaAdmins, admins);
      return true;
    }
    return false;
  },

  obtenerAdmins() {
    return leerJSON(rutaAdmins);
  },

  // --- GESTIÓN DE GRUPOS ---
  obtenerPrefix(groupId) {
    if (!groupId) return config.prefix;
    
    const grupo = gruposCache.find(g => g.group_id === groupId);
    return (grupo && grupo.prefix) ? grupo.prefix : config.prefix;
  },

  actualizarPrefixGrupo(groupId, nuevoPrefix, titulo = 'Grupo') {
    let grupo = gruposCache.find(g => g.group_id === groupId);

    if (!grupo) {
      grupo = {
        group_id: groupId,
        titulo: titulo,
        prefix: nuevoPrefix,
        bienvenida_activa: true,
        registrado_en: new Date().toISOString()
      };
      gruposCache.push(grupo);
    } else {
      grupo.prefix = nuevoPrefix;
    }

    guardarJSON(rutaGrupos, gruposCache);
    return true;
  },

  esGrupoPermitido(groupId) {
    return gruposCache.some(grupo => grupo.group_id === groupId);
  },

  registrarGrupo(groupId, titulo = '') {
    const existe = gruposCache.some(grupo => grupo.group_id === groupId);

    if (!existe) {
      gruposCache.push({
        group_id: groupId,
        titulo: titulo,
        prefix: config.prefix,
        bienvenida_activa: true,
        registrado_en: new Date().toISOString()
      });
      guardarJSON(rutaGrupos, gruposCache);
      return true;
    }
    return false;
  },

  removerGrupo(groupId) {
    const inicialLen = gruposCache.length;
    gruposCache = gruposCache.filter(grupo => grupo.group_id !== groupId);
    if (gruposCache.length !== inicialLen) {
      guardarJSON(rutaGrupos, gruposCache);
      return true;
    }
    return false;
  },

  obtenerGrupos() {
    return gruposCache;
  },
  
  // --- GESTIÓN DE COMANDOS PERSONALIZADOS (comandos.json) ---
  guardarComandoGrupo(groupId, titulo, comando, texto) {
      const cmdLower = comando.toLowerCase();
      let registro = comandosCache.find(c => c.group_id === groupId);

      if (!registro) {
        registro = {
          group_id: groupId,
          titulo: titulo,
          comandos: {}
        };
        comandosCache.push(registro);
      } else {
        // Actualiza el título del grupo por si cambió de nombre
        registro.titulo = titulo;
      }

      registro.comandos[cmdLower] = texto;
      guardarJSON(rutaComandos, comandosCache);
      return true;
    },

    obtenerComandoGrupo(groupId, comando) {
      const cmdLower = comando.toLowerCase();
      const registro = comandosCache.find(c => c.group_id === groupId);
      if (registro && registro.comandos) {
        return registro.comandos[cmdLower] || null;
      }
      return null;
    },

    eliminarComandoGrupo(groupId, comando) {
      const cmdLower = comando.toLowerCase();
      const registro = comandosCache.find(c => c.group_id === groupId);

      if (registro && registro.comandos && registro.comandos[cmdLower]) {
        delete registro.comandos[cmdLower];
        guardarJSON(rutaComandos, comandosCache);
        return true;
      }
      return false;
    },

    obtenerTodosComandosGrupo(chatId) {
  // Ajusta la lectura según la estructura interna de tu JSON/Map
  if (this.baseDatos && this.baseDatos[chatId] && this.baseDatos[chatId].comandos) {
    return this.baseDatos[chatId].comandos;
  }
  return {};
}
  }