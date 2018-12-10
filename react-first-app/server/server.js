var express = require('express');
var app = express();
var fs = require("fs");

app.get('/environments/get', function (req, res) {
   fs.readFile( __dirname + "/" + "../environments.json", 'utf8', function (err, data) {
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

app.post('/environments/add', function (req, res) {
    console.log(req);
});

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

});