var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, '../test')));
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static('node_modules'));

app.use('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(1337, function () {
    console.log('app is listening on port 1337');
});