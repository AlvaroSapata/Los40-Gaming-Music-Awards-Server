const { Schema, model } = require("mongoose");
const cron = require("node-cron")

// TODO: Please make sure you edit the User model to whatever makes sense in this case
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
    votosRestantes:{
      type:Number,
      default:3
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

// Reiniciar los votos cada 24 horas s(opt) min hour day month day/week
cron.schedule("0 0 * * *", async ()=>{
try {
  const users = await User.find()
  for (const user of users){
    user.votosRestantes = 3
    await User.save()
  }
  console.log("votos reiniciados")
} catch (error) {
  console.log(error)
  
}
})


const User = model("User", userSchema);

module.exports = User;
