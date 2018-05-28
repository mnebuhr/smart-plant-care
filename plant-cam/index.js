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

function takePicture() {
  myCamera.snap()
    .then((result) => {
 	setTimeout(takePicture,1);   
    })
    .catch((error) => {
       // Handle your error
    });
}

takePicture();

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/plant.jpg');
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});