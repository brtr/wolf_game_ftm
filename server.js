const path = require('path');
const express = require('express');
const app = express();


app.use(express.static('public'));

app.get('/', function (req, res) {
    console.log("Got a GET request for the homepage");
    res.sendFile( __dirname + "/" + "index.html");
})

app.get('/layer2', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'public/index_l2.html'));
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})
