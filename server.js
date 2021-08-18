const mongoose = require("mongoose");
const express = require('express');
const bcrypt = require('bcrypt');
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
        unique: true,
        required: true
    },
    email: {
        type:String,
        unique: true,
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

 app.post('/user/register', async(req,res)=>{ 
  console.log(req.body);
  const user = new User ();
  const salt = await bcrypt.genSalt(10);
    user.username= req.body.username;
    user.email=req.body.email;
    user.password= req.body.password;
    user.con_password= req.body.con_password;
    user.firstname= req.body.firstname;
    user.lastname=req.body.lastname;
    
      if(user.password === user.con_password){
       user.password =  await bcrypt.hash(req.body.password, salt);
       user.con_password = await bcrypt.hash(req.body.con_password, salt);
        user.save().then((doc) => res.status(201).send(doc));
      }else{
        console.log('password dont match');
      }
});

app.post("/user/login", async (req, res) => {
  console.log(req.body);
  const body = req.body;
  const user = await User.findOne({ username: body.username });
  
  if (user) {
    // check user password with hashed password stored in the database
    const validPassword = await bcrypt.compare(body.password, user.password);
    if (validPassword) {
      let access_token = user._id;
      res.send(access_token);
      console.log(access_token);
    } else {
      res.status(500);
    }
  }
});
app.get('/user/get', (req,res)=>{
  console.log(access_token);
  res.send('hello world');
})
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));