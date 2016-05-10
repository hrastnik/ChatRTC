var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var PeerServer = require('peer').PeerServer;
var io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: path.join(__dirname) });
});

server.listen(3000, function () {
  console.log('App server listening on port 3000!');
});

peerjs_server = PeerServer({
    port: 9000,
    path: '/peer'
});

var randomProperty = function (object) {
  var keys = Object.keys(object);
  return object[keys[Math.floor(keys.length * Math.random())]];
};

var all_peers = [];

io.on('connection', function(socket) {
    var ip = socket.handshake.address;
    
    console.log("IP:", ip, " connect to server");
    
    socket.on('nextStranger', function(requester) {
        console.log('Received nextStranger');
        console.log('Received id :', requester.id);
        if (all_peers.length > 1)
        {
            do {
                var random_id = randomProperty(all_peers);
            } while (random_id == all_peers[ip]); // make sure you can't connect to yourself
            
            socket.emit('nextStranger', {id: random_id});            
        }
    });

    socket.on('registerId', function(user) {
        if (typeof(user) === "string") {
            all_peers[ip] = user.id;
        }
    });
    
    socket.on('disconnect', function(socket){
        delete all_peers[ip];
    });
});


/*peerjs_server.on('connection', function (id) {
    console.log("ID: '", id, "' connected");
});

peerjs_server.on('disconnect', function (id) {
    console.log("ID: '", id, "' disconnected");
});*/