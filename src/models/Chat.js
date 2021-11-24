const mongoose = require('mongoose');
const {Schema} = mongoose;

const ChatSchema = new Schema({
  nick:String,
  msg: String,
  created_at: { type: Date, default: Date.now},
  read_flag: String,
  delete_flag: String,
  room: Number
}
);


module.exports = mongoose.model('Chat',ChatSchema);