const express = require("express");
const router = express.Router();
const songsData = require("../data/songs.json");

router.get("/", (req, res) => {
  res.json(songsData);
});

router.put("/vote/:songId", (req,res)=>{
  const songId = req.params.songId;
  const response = songsData.find((eachSong) => eachSong.id===songId);
  if(response){
    eachSong.votos += 1
    res.json({message: "Voto Agregado"})
  }else{
    res.status(404).json({message: "Canción no encontrada"})
  }
})

// hacer una ruta individual para hacer la llamada a yt cuando se vaya a reproducir el video

module.exports = router;