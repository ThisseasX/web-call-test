const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.set('view engine', 'ejs').use('/', (req, res) => {
  res.render('index', { dog: 'Hello Dog' });
});

io.on('connect', (socket) => {
  socket.emit('message', 'Welcome!');
});

server.listen(3000);
