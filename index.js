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

      app.get('/api/users/:_id/logs', async (req, res)=>{
        try{
        let userId = req.params._id;
        let from = req.query.from;
        let to = req.query.to;
        let limit = parseInt(req.query.limit);
        let inputUser = await User.findById(userId)
        if (inputUser){
        
          !from ? from = new Date(0)
          : from = new Date(from)
          !to ? to = new Date()
          : to = new Date(to)
        
          let exercise_list = await Exercise.find({userId: userId, date: {$gte: from, $lte: to}}).sort({date: 1}).limit(limit).select({userId: 0, _id: 0, __v: 0})
        
          let log=[]
        
            for(let i=0; i<exercise_list.length; i++){
              log.push({date: exercise_list[i].date.toDateString(), description: exercise_list[i].description, duration: exercise_list[i].duration})
            }
        
        let count = log.length
        
         res.json({_id: userId, username: inputUser.username, count: count, log: log});
        }else{ throw "user not found"}
        }catch(err){return res.json({error: err})}
        });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
