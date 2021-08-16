const mongoose = require("mongoose");
const express = require('express');
const {body} = require('express-validator');
const bodyParser = require('body-parser')

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
const UserScema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    con_password: {
        type: String,
        required: true
    },
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    }
});

const User = mongoose.model('User', UserScema);

app.post('/user/register', body('con_password').custom((value,{req})=>{
  if(value!==req.body.password){
    throw new Error('Password confirmation does not match password');
  }
}), body('email').custom(value => {
  return user.findUserByEmail(value).then(userValue => {
    if (userValue) {
      return Promise.reject('E-mail already in use');
    }
    console.log(user.findUserByEmail(value))
  });
}),body('username').custom(value => {
  return user.findUserByUsername(value).then(userValue => {
    if (userValue) {
      return Promise.reject('username already in use');
    }
  });
}),(req,res)=>{ 
  console.log(req.body);
  const user = new User ();
    user.username= req.body.username;
    user.email=req.body.email;
    user.password= req.body.password;
    user.con_password= req.body.con_password;
    user.firstname= req.body.firstname;
    user.lastname=req.body.lastname;
  user.save();
  res.send('user created');
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));


