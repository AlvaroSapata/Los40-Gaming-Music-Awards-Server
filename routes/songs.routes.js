const express = require("express");
const router = express.Router();
const songsData = require("../data/songs.json");
const {isAuthenticated} = require("../middleware/jwt.middleware")
const User = require("../models/User.model");

// api/songs => muestra todas las canciones
router.get("/", (req, res) => {
  res.json(songsData);
});

// api/songs/vote/:songId => Añade un voto a la cancion
router.put("/vote/:songId", isAuthenticated,(req, res) => {
    const songId = req.params.songId;
    console.log(songId);
    // comparando asi si que funciona. tema de ref??
    const song = songsData.find((eachSong) => eachSong.id == songId);
    console.log(song);
    if (song) {
      song.votos += 1;
      res.json({ message: "Voto agregado", song: song });
    } else {
      res.status(404).json({ message: "Canción no encontrada" });
    }
  });
  

// hacer una ruta individual para hacer la llamada a yt cuando se vaya a reproducir el video

// api/songs/:userId => actualiza los votos restantes del usuario
router.put("/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { votosRestantes } = req.body;
  
      // Buscar al usuario por su ID y actualizar los votos restantes
      const updatedUser = await User.findByIdAndUpdate(userId, { votosRestantes }, { new: true });
  
      res.json(updatedUser);
    } catch (error) {
        console.log(error)
      res.status(500).json({ message: "Error al actualizar los votos restantes del usuario." });
    }
  });
  
  module.exports = router;

module.exports = router;