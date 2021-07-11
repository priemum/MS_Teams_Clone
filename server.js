const express = require('express');
const path = require('path'); 
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const {v4: uuidv4} = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/peerjs', peerServer);

// Landing page to join meeting
app.get("/", function(req, res){
	res.render("landingPage");
});

// When video call ends, user comes to the Left Meeting Page
app.get("/left", function(req, res){
	res.render("leftMeeting");
});

// Redirects to the Video-Calling interface
app.get('/join', (req, res) => {
    res.redirect(`/${uuidv4()}`)
  });
   
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
  });

io.on('connection', socket => {
    socket.on('join-room' , (roomId, userId) => {
        socket.join(roomId) 
        socket.broadcast.to(roomId).emit('user-connected', userId);   

        socket.on('message', message => {
          socket.broadcast.to(roomId).emit('message', message)
        })

        socket.on('disconnect', () => {
          socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })

    })
}) 

server.listen(process.env.PORT || 3030);
