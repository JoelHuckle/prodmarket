const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const postRoutes = require("./routes/post");
const cors = require("cors");
const logger = require("morgan");
const passport = require("passport");
require("dotenv").config({ path: "./config/.env" });

// Allow requests from any origin
app.use(cors());

// Passport config
require("./config/passport")(passport);

connectDB();

//accept forms
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Setup Routes For Which The Server Is Listening
// app.use("/", mainRoutes);
app.use("/post", postRoutes);
// app.use("/service", commentRoutes);

app.use(logger("dev"));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
