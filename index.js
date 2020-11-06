const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const uuid = require('uuid');
const { flow, filter, map } = require('lodash/fp');

const PORT = process.env.PORT || 3000;
const PEER_PORT = process.env.PEER_PORT;
const PEER_HOST = process.env.PEER_HOST;
const PEER_SECURE = process.env.PEER_SECURE;

app
  .set('view engine', 'ejs')
  .get('/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    res.render('index', { roomId, PEER_PORT, PEER_HOST, PEER_SECURE });
  })
  .get('/', (req, res) => {
    res.redirect(`/${uuid.v4()}`);
  });

io.on('connect', socket => {
  socket.on('new-peer', (peerId, roomId) => {
    socket.peerId = peerId;
    socket.roomId = roomId;

    socket.join(roomId);
    socket.to(roomId).emit('peer-joined', peerId);

    const allPeersInRoom = flow(
      filter({ roomId }),
      map('peerId'),
    )(io.sockets.sockets);

    socket.emit('all-peers-in-room', allPeersInRoom);
  });

  socket.on('disconnect', () => {
    socket.to(socket.roomId).emit('peer-left', socket.peerId);
  });
});

server.listen(PORT);
