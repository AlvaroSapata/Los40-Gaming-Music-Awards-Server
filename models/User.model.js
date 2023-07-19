const { Schema, model } = require("mongoose");
const cron = require("node-cron");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    username: {
      type: String,
      required: [true, "Username is required."],
    },
    votosRestantes: {
      type: Number,
      default: 3,
    },
    ultimoVotoFecha: {
      type: Date,
      default: null,
    },
    votosCanciones:{
      type:[Schema.Types.ObjectId],
      ref:"Song",
      default: []
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

// Reiniciar los votos cada 24 horas (a las 00:00 AM)
cron.schedule("0 0 * * *", async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      // Reiniciamos los votos, la fecha y el array
        user.votosRestantes = 3;
        user.ultimoVotoFecha = null; 
        user.votosCanciones = []
        await user.save();
      
    }

    console.log("Reinicio completado");
  } catch (error) {
    console.log(error);
  }
});

const User = model("User", userSchema);

module.exports = User;
