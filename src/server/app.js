var express = require('express');
var path = require('path');
var morgan = require('morgan'); // logger
var bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').Server(app);
//var io = require('socket.io').listen(http); //handles chat sockets
var io = require('socket.io')(http); //handles chat sockets
var nodemailer = require('nodemailer'); //sends email if no agent available
var jwt = require('express-jwt'); //json web tokens for authorization
var cors = require('cors'); //required for cross origin requests from auth0

app.use(cors());
app.set('port', (process.env.PORT || 80)); //this is deployed, change port for development

app.use('/', express.static(__dirname + '/../../dist'));
app.use('/', express.static(__dirname + '/../public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

//auth0 authentication
//you must sign up for a free account at auth0.com to get these keys
var auth0Secret = 'g0Ha8D0mM6TJrTZIfxxz6Ey4ewb2gX7wDJK8daUum09ywGueaLqhF2ti2kMmL-nc';
var auth0ClientId = 'tryydia9RW5tOc27TNg3sacg32RNjNcf';
var authCheck = jwt({
  secret: new Buffer(auth0Secret, 'base64'),
  audience: auth0ClientId
});

//initiate db
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/test');
mongoose.connect('mongodb://sam:qwerty@ds133348.mlab.com:33348/heroku_cwd47xfm');
var db = mongoose.connection;
mongoose.Promise = global.Promise;

// Models
var Chat = require('./chat.model.js');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');

  //used to get and change agent online status
  var agentStatus = {isOnline:false};
  app.get('/agentStatus', function(req, res) {
    res.json(agentStatus);
  });
  app.post('/agentStatus', function(req, res) {
    agentStatus = req.body;
    res.json(agentStatus);
  });

  //chat APIs
  // select all
  app.get('/chats', function(req, res) {
    Chat.find({}, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });

  //find by socket id to pair with db id
  app.get('/chats/find', function(req, res) {
    Chat.findOne({'messages.socketId':req}, function(err, obj) {
      if(err) return console.error(err);
      res.json(obj);
    });
  });

  // create a new chat object
  app.post('/chat', function(req, res) {
    var obj = new Chat(req.body);
    obj.save(function(err, obj) {
      if(err) return console.error(err);
      res.status(200).json(obj);
    });
  });

  // find by id
  app.get('/chat/:id', function(req, res) {
    Chat.findOne({_id: req.params.id}, function(err, obj) {
      if(err) return console.error(err);
      res.json(obj);
    });
  });

  // update by id (push new message to chat object)
  app.put('/chat/:id', function(req, res) {
    Chat.findByIdAndUpdate(
      {_id: req.params.id},
      {$push: {"messages": {socketId:req.body.socketId, sender:req.body.sender, message:req.body.message, time:req.body.time}}},
      {safe: true, upsert: true},
      function(err, model) {
        if(err) return console.error(err);
        res.sendStatus(200);
      }
    );
  });

  // delete by id
  app.delete('/chat/:id', function(req, res) {
    Chat.findOneAndRemove({_id: req.params.id}, function(err) {
      if(err) return console.error(err);
      res.sendStatus(200);
    });
  });

  // send Email when no agents are online
  app.post('/sendEmail', function(req, res) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'user@gmail.com', // Your email id
            pass: 'password' // Your password
        }
    });
    var mailOptions = {
        from: '"NEW CUSTOMER" <user@gmail.com>', // sender address
        replyTo: req.body.email, // the from field is a bit buggy, this ensures you reply to the correct email address
        to: 'user@gmail.com', // who will receive the email
        subject: 'New Customer Email from ' + req.body.name, // Subject line
        text: req.body.comment //, // plaintext body
        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.json({yo: 'error'});
        }else{
            console.log('Message sent: ' + info.response);
            res.json({yo: info.response});
        }
      });
    });

  // all other routes are handled by Angular
  app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname,'/../../dist/index.html'));
  });

  //socket.io
  let openSockets = 0; //number of open sockets

  io.on('connection', (socket) => {
    openSockets++;
    console.log('user connected. '+openSockets+' open connections.');
    let userId = socket.id;
    io.to(socket.id).emit("abc", socket.id); //sends socketId to client

    socket.on('disconnect', function(){
      openSockets--;
      console.log('user disconnected. '+openSockets+' open connections.');
    });

    //sets format of new message based on sender
    socket.on('add-message', (message, userName, dbId, chatId, agent) => {
      if (agent){
        console.log('agent message');
        io.emit('message', {type:'new-message', sender: 'agent', id: chatId, content: message, user: userName});
      }else{
        console.log('client message');
        io.emit('message', {type:'new-message', sender: 'client', id: userId, dbId: dbId, content: message, user: userName});
      }
    });
  });

  http.listen(app.get('port'), function() {
    console.log('Angular 2 Full Stack C2B Chat listening on port '+app.get('port'));
  });
});

module.exports = app;
