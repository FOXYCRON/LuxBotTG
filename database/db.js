const fs = require('fs');
const path = require('path');

const rutaJson = path.join(__dirname, 'bot_data.json');

// Estructura por defecto si el archivo no existe
const datosIniciales = {
  admins: [],
  grupos: []
};

// Crear el archivo si no existe
if (!fs.existsSync(rutaJson)) {
  fs.writeFileSync(rutaJson, JSON.stringify(datosIniciales, null, 2), 'utf-8');
}

// Función para leer los datos del JSON
function leerDB() {
  try {
    const contenido = fs.readFileSync(rutaJson, 'utf-8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error al leer bot_data.json:', error);
    return datosIniciales;
  }
}

// Función para guardar los datos en el JSON
function guardarDB(data) {
  try {
    fs.writeFileSync(rutaJson, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error al guardar en bot_data.json:', error);
  }
}

module.exports = {
  leerDB,
  guardarDB
};