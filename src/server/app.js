var express = require('express');
var path = require('path');
var morgan = require('morgan'); // logger
var bodyParser = require('body-parser');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(__dirname + '/../../dist'));
app.use('/', express.static(__dirname + '/../public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
mongoose.Promise = global.Promise;

// Models
var Cat = require('./cat.model.js');
var Chat = require('./chat.model.js');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');

  // APIs
  // select all
  app.get('/cats', function(req, res) {
    Cat.find({}, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });

  // count all
  app.get('/cats/count', function(req, res) {
    Cat.count(function(err, count) {
      if(err) return console.error(err);
      res.json(count);
    });
  });

  // create
  app.post('/cat', function(req, res) {
    var obj = new Cat(req.body);
    obj.save(function(err, obj) {
      if(err) return console.error(err);
      res.status(200).json(obj);
    });
  });

  // find by id
  app.get('/cat/:id', function(req, res) {
    Cat.findOne({_id: req.params.id}, function(err, obj) {
      if(err) return console.error(err);
      res.json(obj);
    })
  });

  // update by id
  app.put('/cat/:id', function(req, res) {
    Cat.findOneAndUpdate({_id: req.params.id}, req.body, function(err) {
      if(err) return console.error(err);
      res.sendStatus(200);
    })
  });

  // delete by id
  app.delete('/cat/:id', function(req, res) {
    Cat.findOneAndRemove({_id: req.params.id}, function(err) {
      if(err) return console.error(err);
      res.sendStatus(200);
    });
  });

  //chat APIs
  // select all
  app.get('/chats', function(req, res) {
    Chat.find({}, function(err, docs) {
      if(err) return console.error(err);
      res.json(docs);
    });
  });

  // create
  app.post('/chat', function(req, res) {
    var obj = new Chat(req.body);
    obj.save(function(err, obj) {
      if(err) return console.error(err);
      res.status(200).json(obj);
      console.log(obj);
    });
  });

  // find by id
  app.get('/chat/:id', function(req, res) {
    Chat.findOne({_id: req.params.id}, function(err, obj) {
      if(err) return console.error(err);
      res.json(obj);
    })
  });

  // update by id
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


  // all other routes are handled by Angular
  app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname,'/../../dist/index.html'));
  });

  let openSockets = [];

  io.on('connection', (socket) => {
    console.log('user connected');
    let userId = socket.id;
    openSockets.push(userId);
    console.log(openSockets);
    io.to(socket.id).emit("abc", socket.id);
    io.to(socket.id).emit("agent", openSockets);

    socket.on('disconnect', function(){
      let socketIndex = openSockets.indexOf(userId);
      openSockets.splice(socketIndex,1);
      console.log(openSockets);
      console.log('user disconnected');
    });

    socket.on('add-message', (message, userName, chatId, agent) => {
      if (agent){
        io.emit('message', {type:'new-message', sender: 'agent', id: chatId, content: message, user: userName});
      }else{
        io.emit('message', {type:'new-message', sender: 'client', id: userId, content: message, user: userName});
      }
      console.log(message);
    });
    socket.on('agent-message', (message, chatId, userName) => {
      io.to(chatId).emit('message', {type:'new-message', sender: 'agent', id: chatId, content: message, user: userName});
      console.log(message);
    });
  });

  http.listen(app.get('port'), function() {
    console.log('Angular 2 Full Stack listening on port '+app.get('port'));
  });
});

module.exports = app;
