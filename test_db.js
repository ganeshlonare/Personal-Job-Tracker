require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const User = require("./src/models/User.ts").default;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.collection("users").find({}).toArray();
  console.log(users.map(u => ({ email: u.email, streak: u.currentStreak, lastActive: u.lastActiveDate })));
  process.exit(0);
}
run();
