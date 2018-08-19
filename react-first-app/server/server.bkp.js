var express = require('express');
var app = express();
var fs = require("fs");

app.get('/environments', function (req, res) {
   fs.readFile( __dirname + "/" + "environments.json", 'utf8', function (err, data) {
      if (err) {
        console.log('varun');
        data = '{}';
      }
      if(data && data == '') {
        data = '{}';
      }
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.end(data);
   });
});

var user = {
  "user4" : {
     "name" : "mohit",
     "password" : "password4",
     "profession" : "teacher",
     "id": 4
  }
}

app.post('/addEnv', function (req, res) {
  // First read existing users.
  fs.readFile( __dirname + "/" + "environments.json", 'utf8', function (err, data) {
      data = JSON.parse( data );
      data["user4"] = user["user4"];
      console.log( data );
      res.end(JSON.stringify(data));
  });
});

app.post('/updateEnv', function (req, res) {
  // First read existing users.
  fs.readFile( __dirname + "/" + "environments.json", 'utf8', function (err, data) {
      data = JSON.parse( data );
      data["user4"] = user["user4"];
      console.log( data );
      res.end(JSON.stringify(data));
  });
});

app.get('/:id', function (req, res) {
  // First read existing users.
  fs.readFile( __dirname + "/" + "environments.json", 'utf8', function (err, data) {
     var users = JSON.parse( data );
     var user = users["user" + req.params.id] 
     console.log( user );
     res.end( JSON.stringify(user));
  });
});


var id = 2;

app.delete('/deleteEnv', function (req, res) {

   // First read existing users.
   fs.readFile( __dirname + "/" + "environments.json", 'utf8', function (err, data) {
       data = JSON.parse( data );
       delete data["user" + 2];
       
       console.log( data );
       res.end( JSON.stringify(data));
   });
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

});