const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
  nick:String,
  password: String,
  created_at: { type: Date, default: Date.now}
}
);

module.exports = mongoose.model('User',UserSchema);
