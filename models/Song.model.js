const { Schema, model } = require("mongoose");
const cron = require("node-cron");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const songSchema = new Schema(
  {
    titulo: {
      type: String,
      unique: true,
    },
    artista: {
      type: String,
    },
    juego: {
      type: String,
    },
    votos: {
      type: Number,
    },
    link: {
      type: String,
    },
    votosHoy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    votosSemana: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
  },
  {
    timestamps: true,
  }
);

// Esta función se ejecutará todos los días a la medianoche (00:00)
cron.schedule("0 0 * * *", async () => {
  try {
    // Reiniciar los votosHoy de todas las canciones
    await Song.updateMany({}, { $set: { votosHoy: [] } });
    console.log("Se han reiniciado los votosHoy de todas las canciones.");
  } catch (error) {
    console.error("Error al reiniciar los votosHoy:", error);
  }
});

// Esta función se ejecutará todos los días a la medianoche (00:00)
cron.schedule("0 0 * * 1", async () => {
  try {
    // Reiniciar los votosHoy de todas las canciones
    await Song.updateMany({}, { $set: { votosSemana: [] } });
    console.log("Se han reiniciado los votosSemana de todas las canciones.");
  } catch (error) {
    console.error("Error al reiniciar los votosSemana:", error);
  }
});

const Song = model("Song", songSchema);

module.exports = Song;