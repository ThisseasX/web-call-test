// Init socket
const socket = io('/');

// Init peer
const myPeer = new Peer({
  host: PEER_HOST,
  port: PEER_PORT,
  secure: PEER_SECURE === 'true',
});

// Init my video
(async () => {
  log('INIT MY VIDEO');

  const myStream = await getMyStream();
  const video = document.createElement('video');

  addVideo(video, myStream, myPeer.id, true);
})();

// Fired when peer connects to peerjs server
myPeer.on('open', peerId => {
  log('ME', peerId);

  socket.emit('join-room', ROOM_ID, peerId);
});

// Fired when another peer calls me
myPeer.on('call', async call => {
  log('CALL IN', call.peer);

  const myStream = await getMyStream();
  call.answer(myStream);

  handleCallStream(call, call.peer);
});

// Fired when a new user opens the page and joins the same room
socket.on('user-joined', async userPeerId => {
  log('USER JOINED', userPeerId);
  log('CALL OUT', userPeerId);

  const myStream = await getMyStream();
  const call = myPeer.call(userPeerId, myStream);

  handleCallStream(call, userPeerId);
});

// Fired when a user closes the page and leaves the room
socket.on('user-left', userPeerId => {
  const callObj = calls[userPeerId] || {};
  const { call, video } = callObj;

  if (call && video) {
    call.close();
    video.remove();
    delete calls[userPeerId];
  }
});
