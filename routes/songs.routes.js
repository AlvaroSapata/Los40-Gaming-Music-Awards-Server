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

router.put("/vote/:songId", isAuthenticated, async (req, res, next) => {
  const songId = req.params.songId;
  const userId = req.payload._id;
  const today = new Date().setHours(0, 0, 0, 0);

  try {
    // Comprobar que exista el usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    // Comprobar que le queden votos al usuario
    if (user.votosRestantes <= 0) {
      return res.status(403).json({ error: "No te quedan votos" });
    }

    // Comprobar que no haya votado hoy a esa canción
    const foundSong = await Songs.findById(songId);
    if (!foundSong) {
      return res.status(404).json({ error: "Cancion no encontrada" });
    }

    if (!foundSong.votosHoy) {
      foundSong.votosHoy = [];
    }

    const yaVotadoHoy = foundSong.votosHoy.some((vote) => {
      return (
        vote.userId &&
        vote.userId.toString() === userId &&
        new Date(vote.date).setHours(0, 0, 0, 0) === today
      );
    });

    if (yaVotadoHoy) {
      return res
        .status(403)
        .json({ error: "Ya has votado a esta cancion hoy." });
    }

    // Agregar la fecha de voto al array votosHoy
    foundSong.votosHoy.push({
      userId: userId.toString(),
      date: new Date(),
    });

    // Agregar la fecha de voto al array votosSemana
    foundSong.votosSemana.push({
      userId: userId.toString(),
      date: new Date(),
    });

    // Actualizar los votos de la canción y guardarla en la base de datos
    foundSong.votos += 1;
    await foundSong.save();

    // Actualizar la info del usuario
    user.votosCanciones.push(songId);
    user.ultimoVotoFecha = new Date();
    user.votosRestantes -= 1;
    await user.save();

    res.json(foundSong);
  } catch (error) {
    next(error);
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
    res.status(500).json({
      message: "Error al actualizar los votos restantes del usuario.",
    });
  }
});

// api/songs/getRandomSong => Ruta para obtener la canción del día
router.get("/getRandomSong", async (req, res) => {
  try {
    const songOfTheDay = await Songs.findOne({ cancionDelDia: true });

    if (songOfTheDay) {
      res.status(200).json(songOfTheDay);
    } else {
      const allSongs = await Songs.find({});
      const randomIndex = Math.floor(Math.random() * allSongs.length);
      const randomChosenSong = allSongs[randomIndex];

      // Marca la canción seleccionada como la canción del día
      randomChosenSong.cancionDelDia = true;

      // Guarda la nueva canción en la base de datos
      await randomChosenSong.save();

      res.status(200).json(randomChosenSong);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener la canción del día" });
  }
});

// api/songs/most-voted-song-of-day => devuelve la ruta mas votada del dia
router.get("/most-voted-song-of-day", async (req, res) => {
  try {
    // Calculate the current day's start and end timestamps
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    // Use an aggregation pipeline to get all songs within the current day and sort them by votes in descending order
    const songsOfDay = await Songs.aggregate([
      // filtrar las canciones que hayan sido votadas hoy
      {
        $match: {
          "votosHoy.date": { $gte: startOfDay, $lt: endOfDay },
        },
      },
      // Calcula el tamaño de la propiedad y la guarda en el contador
      {
        $addFields: {
          votosHoyCount: { $size: "$votosHoy" },
        },
      },
      // Ordena en funcion del array de votosHoy y en caso de empate, por votos generales
      {
        $sort: { votosHoyCount: -1, votos: -1 }, // Sort by votosHoyCount and votos in descending order
      },
    ]);
    if (songsOfDay.length === 0) {
      // No song found for the current day with votes      // Get the topmost song with the most votes (most voted song overall)
      const mostVotedSongOverall = await Songs.find().sort({ votos: -1 });
      if (!mostVotedSongOverall) {
        return res
          .status(404)
          .json({ error: "No hay canciones con votos en el dia actual." });
      }
      res.json(mostVotedSongOverall[0]);
    } else {
      // Get the topmost song with the most votes (most voted song of the day)
      res.json(songsOfDay[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor." });
  }
});

// api/songs/most-voted-song-of-day => devuelve la ruta mas votada de la semana
router.get("/most-voted-song-of-week", async (req, res) => {
  try {
    // Calculate the start and end timestamps for the current week
    const now = new Date();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() // Subtract the current day of the week to get the start of the week (Sunday)
    );
    const endOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + 7 // Add 7 days to get the end of the week (Saturday)
    );

    // Use an aggregation pipeline to get all songs within the current week and sort them by votosSemana count and votos in descending order
    const songsOfWeek = await Songs.aggregate([
      {
        $match: {
          "votosSemana.date": { $gte: startOfWeek, $lt: endOfWeek },
        },
      },
      {
        $addFields: {
          votosSemanaCount: { $size: "$votosSemana" },
        },
      },
      {
        $sort: { votosSemanaCount: -1, votos: -1 },
      },
    ]);

    if (songsOfWeek.length === 0) {
      // No song found for the current week with votes
      // Get the topmost song with the most votes (most voted song overall)
      const mostVotedSongOverall = await Songs.find().sort({ votos: -1 });
      if (!mostVotedSongOverall) {
        return res
          .status(404)
          .json({ error: "No hay canciones con votos en la semana actual." });
      }
      res.json(mostVotedSongOverall[0]);
    } else {
      // Get the topmost song with the most votosSemanaCount and votos (most voted song of the week)
      res.json(songsOfWeek[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor." });
  }
});

module.exports = router;
