const express = require("express");
const router = express.Router();
const songsData = require("../data/songs.json");

router.get("/", (req, res) => {
  res.json(songsData);
});

// hacer una ruta individual para hacer la llamada a yt cuando se vaya a reproducir el video

module.exports = router;