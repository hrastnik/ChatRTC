(function (){

    function initUserMedia() {
        um = navigator.getUserMedia || navigator.webkitGetUserMedia ||
               navigator.mozGetUserMedia || navigator.msGetUserMedia;
        
        if (!!um) {
            navigator.getUserMedia = um;
            return true;
        }
        return false;
    }
    
    toggleVideoPlayPause = function() {
        var video = document.getElementById('local_video');
        if (!video.paused) video.pause();
        else video.play();
    }
    
    window.addEventListener('load', function()
    {
        if (initUserMedia()) 
        {
            navigator.getUserMedia({
                video: true,
                audio: true
            }, function successCallback(localMediaStream) {
                var video = document.getElementById('local_video');
                window.localMediaStream = localMediaStream; // Save this for later
                video.src = window.URL.createObjectURL(localMediaStream);
            }, function errorCallback(e) {
                console.log("Failed getting user media");
                if (e) throw e;
            });

            var peer = new Peer('', {
                host: window.location.hostname,
                secure:true,
                key:'peerjs',
                port: 443, 
                path: '/peer'
            });                
            
            peer.on('open', function() {
                console.log("Connected to Peer.js");
            });
            
            var socket = io.connect(window.location.href);
            socket.on('connect', function(err){
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Connected to socket.io");
                    // Register our id with the server
                    // or wait for id from server and then register
                    if (peer.open) {
                        socket.emit('registerId', {id: peer.id});        
                    }
                    else {
                        peer.on('open', function() {
                            socket.emit('registerId', {id: peer.id});        
                        });    
                    }                                               
                }
            });
            
            var onCallConnected = function(stream) {
                var video = document.getElementById('remote_video');
                video.src = window.URL.createObjectURL(stream);
            };
            
            socket.on('nextStranger', function(stranger) {
                if (window.localMediaStream) {
                    var call = peer.call(stranger.id, window.localMediaStream); 
                    call.on('stream', onCallConnected);
                }
            });
            
            peer.on('call', function(call) {
                call.answer(window.localMediaStream);
                call.on('stream', onCallConnected);
            });
            
            document.getElementById('nextButton').onclick = function(){
                socket.emit('nextStranger');
            };
        }
        else 
        {
            console.log("Failer getting user media... Unsuportted browser");    
        }        
    });
  
})()