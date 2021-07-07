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

// landing page to join meeting
app.get("/", function(req, res){
	res.render("landingPage");
});

// when vc ends it comes to left meeting pg
app.get("/left", function(req, res){
	res.render("leftMeeting");
});

// video calling interface
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
          // io.to(roomId).emit('message', message)
          socket.broadcast.to(roomId).emit('message', message)
        })

        socket.on('disconnect', () => {
          socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })

    })
}) 

server.listen(3030);
