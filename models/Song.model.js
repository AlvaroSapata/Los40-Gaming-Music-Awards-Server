const { Schema, model } = require("mongoose");

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
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Song = model("Song", songSchema);

module.exports = Song;