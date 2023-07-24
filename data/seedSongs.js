const Song = require('../models/Song.model');
const songsData = require('../data/songs.json');
const mongoose = require('mongoose');

// Configurar el tiempo de espera a 30 segundos (30000 ms)
mongoose.set('bufferTimeoutMS', 30000);

// Conectar a la base de datos
mongoose.connect('mongodb://127.0.0.1:27017/Los40-Gaming-Music-Awards')
  .then(() => {
    console.log('Conexión exitosa a la base de datos');
    // Crear las canciones
    createSongs();
  })
  .catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
  });

// Lógica para crear las canciones
async function createSongs() {
  try {
    // Insertar o actualizar cada canción en la base de datos
    for (const songData of songsData) {
      const { titulo, artista, juego, link } = songData;
      const existingSong = await Song.findOne({ titulo });

      if (!existingSong) {
        // La canción no existe, así que la creamos
        await Song.create(songData);
        console.log(`Canción creada: ${titulo}`);
      } else {
        // La canción ya existe, actualizamos las propiedades sin tocar "votos"
        await Song.findOneAndUpdate(
          { titulo },
          { artista, juego, link },
          { new: true }
        );
        console.log(`Canción actualizada: ${titulo}`);
      }
    }

    console.log('Canciones creadas o actualizadas exitosamente');
  } catch (error) {
    console.error('Error al crear o actualizar las canciones:', error);
  } finally {
    // Desconectar de la base de datos
    mongoose.disconnect();
  }
}
