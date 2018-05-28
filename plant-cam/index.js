var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var path = require('path');

const PiCamera = require('pi-camera');
const myCamera = new PiCamera({
  mode: 'photo',
  output: `${ __dirname }/plant.jpg`,
  width: 640,
  height: 480,
  nopreview: true,
});


myCamera.snap()
  .then((result) => {
    // Your picture was captured
    console.log(result);
  })
  .catch((error) => {
     // Handle your error
  });

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/plant.jpg');
  myCamera.snap()
    .then((result) => {
      // Your picture was captured
      console.log(result);
    })
    .catch((error) => {
       // Handle your error
    });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});