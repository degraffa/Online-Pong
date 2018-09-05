var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user has connected: ' + socket.id);
    socket.on('mouse', function(){
        console.log('click event recieved');
        socket.emit('mouse');
    });

    socket.on('p1MoveUp', function(){
        socket.broadcast.emit('p1MoveUp');
    });

    socket.on('p1MoveDown', function(){
        socket.broadcast.emit('p1MoveDown');
    });

    socket.on('p2MoveUp', function(){
        socket.broadcast.emit('p2MoveUp');
    });

    socket.on('p2MoveDown', function(){
        socket.broadcast.emit('p2MoveDown');
    });
});


server.listen(3000, function(){
    console.log('listening on *:3000');
});