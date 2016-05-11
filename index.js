var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var PeerServer = require('peer').ExpressPeerServer;
var io = require('socket.io')(server);
var swig = require('swig');

var PORT = process.env.PORT || 9000; 

// Make public files accessible
app.use(express.static('public'));

// Routing
app.get('/', function (req, res) {
    console.log("Serving file index.html");
    //res.sendFile('index.html', { root: path.join(__dirname) });
    res.send(swig.renderFile('index.html', {port:PORT}));
});

app.get('/favicon.ico', function(req, res) {
    res.sendStatus(404);
});

server.listen(PORT, function (err) {
    if (err) throw err;
    console.log('App server listening on port', PORT, '!');
});

// PeerJS stuff
peerServer = PeerServer(server, {
    key: 'peerjs'
});

peerServer.on('connection', function(id){
    console.log("Peer with id", id, "connected");
});

peerServer.on('disconnect', function(id){
    console.log("Peer with id", id, "disconnected");
});

app.use('/peer', peerServer);

// Returns random property from object
function randomProperty(object) {
var keys = Object.keys(object);
return object[keys[Math.floor(keys.length * Math.random())]];
};

// Object containing all currently connected ip->peerId mappings
var all_peers = [];

io.on('connection', function(socket) {
    var ip = socket.handshake.address;
    
    console.log("socket.io on 'connection' -> ip =", ip);
    
    // Get random id and return to requester
    socket.on('nextStranger', function(requester) {
        console.log('Received nextStranger from ', ip);
        if (all_peers.length > 1) {
            do {
                var random_id = randomProperty(all_peers);
            } while (random_id == all_peers[ip]); // make sure you can't connect to yourself 
            console.log("Responding with nextStranger: id", random_id);           
            socket.emit('nextStranger', {id: random_id});            
        }
    });

    // Register peerId with ip address 
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
    
    // Remove ip address from mappings
    socket.on('disconnect', function(socket){
        delete all_peers[ip];
    });
});