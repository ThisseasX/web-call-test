const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs').use('/', (_, res) => {
  res.render('index');
});

io.on('connect', socket => {
  socket.on('new-peer', peerId => {
    socket.broadcast.emit('peer-joined', peerId);
    socket.peerId = peerId;

    const allPeers = Object.entries(io.sockets.sockets).map(
      ([_, sock]) => sock.peerId,
    );

    socket.emit('all-peers', allPeers);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('peer-left', socket.peerId);
  });
});

server.listen(PORT);
