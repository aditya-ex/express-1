const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db =
  "mongodb+srv://aditya:adi@123@cluster0.izpgp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

app.use(express.json());

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  con_password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

app.post("/user/register", async (req, res) => {
  console.log(req.body);
  const user = new User();
  const salt = await bcrypt.genSalt(10);
  user.username = req.body.username;
  user.email = req.body.email;
  user.password = req.body.password;
  user.con_password = req.body.con_password;
  user.firstname = req.body.firstname;
  user.lastname = req.body.lastname;

  if (user.password === user.con_password) {
    user.password = await bcrypt.hash(req.body.password, salt);
    user.con_password = await bcrypt.hash(req.body.con_password, salt);
    user.save().then((doc) => res.status(201).send(doc));
  } else {
    res.status(401).send("unauthorized");
    console.log("password dont match");
  }
});

app.post("/user/login", async (req, res) => {
  console.log(req.body);
  const body = req.body;
  const user = await User.findOne({ username: body.username });

  if (user) {
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (validPassword) {
      let access_token = user._id;
      res.send(access_token);
      console.log(access_token);
    } else {
      res.status(500);
      res.send("internal server error");
    }
  }
});

const checkObjectId = (idToCheck) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.headers[idToCheck]))
    return res.status(400).json({ msg: "Invalid ID" });
  next();
};

app.get("/user/get", checkObjectId("access_token"), async (req, res) => {
  try {
    const userResult = await User.findById(req.headers["access_token"]);
    if (!userResult) {
      return res.status(404).json({ msg: "user not found" });
    }
    res.json(userResult);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

app.put("/user/delete", checkObjectId("access_token"), async (req, res) => {
  try {
    const userResult = await User.findById(req.headers["access_token"]);
    if (!userResult) {
      return res.status(404).json({ msg: "user not found" });
    }
    userResult.remove();
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

app.get("/user/list/:page", async (req, res) => {
  let perPage = 10;
  let page = Math.max(0, req.params["page"]);
  let userList = await User.find()
    .skip(perPage * (page - 1))
    .limit(perPage);
  res.json(userList);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
