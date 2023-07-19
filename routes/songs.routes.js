const express = require("express");
const router = express.Router();
const songsData = require("../data/songs.json");
const { isAuthenticated } = require("../middleware/jwt.middleware");
const User = require("../models/User.model");
const Songs = require("../models/Song.model");

// api/songs => muestra todas las canciones
router.get("/", async (req, res, next) => {
  try {
    const response = await Songs.find();
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// api/songs/vote/:songId => Añade un voto a la cancion
router.put("/vote/:songId", isAuthenticated, async (req, res, next) => {
  const songId = req.params.songId;
  const userId = req.payload._id;
  // Commprobar que exista el usuario
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  // Comprobar que le queden votos al usuario
  if (user.votosRestantes <= 0) {
    return res.status(403).json({ error: "No te quedan votos" });
  }

  // Comprobar que no haya votado hoy a esa cancion
  const today = new Date().setHours(0, 0, 0, 0);

  // creamos un bool que sera true cuando el usuario ya haya votado a una cancion
  const yaVotado = user.votosCanciones.includes(songId)
  console.log(yaVotado)

  if (yaVotado && user.ultimoVotoFecha && new Date(user.ultimoVotoFecha).setHours(0, 0, 0, 0) === today) {
    return res.status(403).json({ error: "Ya has votado a esta cancion hoy." });
  }

  try {
    // Comprobar que la cancion exista
    const foundSong = await Songs.findById(songId);
    
    if (!foundSong) {
      return res.status(404).json({ error: "Cancion no encontrada" });
    }
    // Actualizar los votos de la cancion
    const response = await Songs.findByIdAndUpdate(songId, {
      votos: foundSong.votos + 1,
    });

    // Actualizar la info del usuario
    user.votosCanciones.push(songId)
    user.ultimoVotoFecha = new Date();
    user.votosRestantes -= 1;
    await user.save();

    res.json(response);
  } catch (error) {
    next(err);
  }
});

//? hacer una ruta individual para hacer la llamada a yt cuando se vaya a reproducir el video

// api/songs/:userId => actualiza los votos restantes del usuario
router.put("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { votosRestantes } = req.body;

    // Buscar al usuario por su ID y actualizar los votos restantes
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { votosRestantes },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message: "Error al actualizar los votos restantes del usuario.",
      });
  }
});

module.exports = router;