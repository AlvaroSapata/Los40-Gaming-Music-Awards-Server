const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json("Los 40 - All good in here");
});

router.use("/auth", require("./auth.routes"));
router.use("/songs", require("./songs.routes"));

module.exports = router;
