require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
const mongoose = require('mongoose'); 

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true});

let Schema = mongoose.Schema;
let userSchema = new Schema({
  username: String
});

let User = mongoose.model("User", userSchema);

let exerciseSchema = new Schema({
  userId: {
  type: String,
  required: true
 },
  description: {
  type: String,
  required: true
 },
  duration: {
  type: Number,
  required: true
  },
  date: Date
  });

let Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/users', async (req, res)=>{
  let inputName = await User.findOne({username: req.body.username})
  if (inputName) {
    res.json({username: inputName.username, _id: inputName.id})} 
else 
{
 inputName = new User({username: req.body.username})
 await inputName.save()
 res.json({username: inputName.username, _id: inputName.id})
}
});

app.get('/api/users', (req, res) =>{
  User.find((err,users) => {
    return res.json(users);
   });
});

app.post('/api/users/:_id/exercises', async (req, res)=>{
  try{
    let userId = req.params._id;
    let description = req.body.description;
    let duration = parseInt(req.body.duration);
    let date = req.body.date;

let inputUser = await User.findById(userId)
        if (inputUser) {
          !date ? date = new Date()
          : date = new Date(date)
          if(date.toString() === 'Invalid Date') {return res.json({error: date.toString()})}
          
            let inputExercise = new Exercise({
                userId: userId,
                description: description,
                duration: duration,
                date: date
            });
               await inputExercise.save();

  res.json({_id: inputUser.id, username: inputUser.username, date: inputExercise.date.toDateString(), duration: duration, description: description})
                }
       else {throw "user not found"}
      }catch(err){return res.json(err)}
      });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
