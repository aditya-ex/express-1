const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const users = require("./routes/users");
const data = require("./routes/data");
const passport = require("passport");
const User = require("./models/User");
const LocalStrategy = require('passport-local').Strategy;
const fileupload = require("express-fileupload");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("dotenv").config();

const db = process.env.URI;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(fileupload({ useTempFiles: true }));
app.use("/user", users);
app.use("/fetch", data);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
