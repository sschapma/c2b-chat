var mongoose = require('mongoose');

var chatSchema = mongoose.Schema({
    userName: String,
    messages: [{
      message:String,
      sender:String,
      socketId: String,
      time : { type : Date, default: Date.now }
    }]
});

var Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
