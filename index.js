var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var PeerServer = require('peer').ExpressPeerServer;
var io = require('socket.io')(server);

var PORT = process.env.PORT || 80; 

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: path.join(__dirname) });
});

app.get('/favicon.ico', function(req, res) {
    res.sendStatus(404);
});

server.listen(PORT, function (err) {
    if (err) throw err;
    console.log('App server listening on port', PORT, '!');
});

app.use('/peer', PeerServer(server, {}));
server.on('connection', function(){
    console.log("server.on.connection");
});
server.on('disconnect', function(){
    console.log("server.on.disconnect");
});
/*peerjs_server = PeerServer({
    port: PEER_PORT,
    path: '/peer'
});*/


var randomProperty = function (object) {
  var keys = Object.keys(object);
  return object[keys[Math.floor(keys.length * Math.random())]];
};

var all_peers = [];

io.on('connection', function(socket) {
    var ip = socket.handshake.address;
    
    console.log("IP:", ip, " connect to server");
    
    socket.on('nextStranger', function(requester) {
        console.log('Received nextStranger from ', ip);
        if (all_peers.length > 1)
        {
            do {
                var random_id = randomProperty(all_peers);
            } while (random_id == all_peers[ip]); // make sure you can't connect to yourself
            
            socket.emit('nextStranger', {id: random_id});            
        }
    });

    socket.on('registerId', function(user) {
        console.log("Received registerId from ", ip);
        if (typeof(user.id) === "string") {
            all_peers[ip] = user.id;
            console.log("ID '", user.id, "' successfully registered for ip ", ip);
        }
        else {
            console.log("Error registering ID");
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