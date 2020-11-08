const express = require('express');
const http = require('http');
const Socket = require('socket.io');
const uuid = require('uuid');

const PORT = process.env.PORT || 3000;
const PEER_PORT = process.env.PEER_PORT;
const PEER_HOST = process.env.PEER_HOST;
const PEER_SECURE = process.env.PEER_SECURE;
const DEBUG = process.env.DEBUG;

const app = express();
const server = http.createServer(app);
const io = Socket(server);

app
  .set('view engine', 'ejs')
  .use(express.static('public'))
  .get('/', (_, res) => {
    res.redirect(`/${uuid.v4()}`);
  })
  .get('/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    res.render('index', { roomId, PEER_PORT, PEER_HOST, PEER_SECURE, DEBUG });
  });

io.on('connect', socket => {
  socket.on('join-room', (roomId, userPeerId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', userPeerId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-left', userPeerId);
    });
  });
});

server.listen(PORT);
