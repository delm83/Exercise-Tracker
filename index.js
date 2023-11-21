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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
