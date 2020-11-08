/**
 *  Memoized fn to cache and return my own stream.
 */
const getMyStream = (() => {
  let stream;

  return async () => {
    if (stream) {
      log('RETURNING CACHED STREAM');
      return stream;
    }

    log('CREATING NEW STREAM');

    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
      },
      video: true,
    });

    stream = newStream;
    return newStream;
  };
})();

/**
 * Just a logging fn.
 *
 * @param {string} label
 * @param {string} msg
 */
function log(label, msg) {
  if (DEBUG === 'true') {
    console.log(`[${label}]` + (msg ? `: ${msg}` : ''));
  }
}

/**
 * Fn to handle the reception of another peer's stream.
 *
 * @param {*} call
 * @param {*} userPeerId
 */
function handleCallStream(call, userPeerId) {
  log('HANDLE CALL STREAM', userPeerId);

  // This must stay outside on('stream'), because
  // on('stream') fires twice (once for audio + video,
  // and once for audio only).
  const video = document.createElement('video');

  call.on('stream', userStream => {
    log('CALL STREAM', userPeerId);

    if (!calls[userPeerId]) {
      calls[userPeerId] = { call, video };
      addVideo(video, userStream, userPeerId);
    }
  });
}

/**
 * Fn to init a new video element with a stream
 * and add it to the videoContainer.
 *
 * @param {HTMLVideoElement} video
 * @param {MediaStream} stream
 * @param {string} id
 * @param {boolean} muted
 */
function addVideo(video, stream, id, muted) {
  log('ADD VIDEO', id);

  videoContainer.appendChild(video);

  video.muted = muted;
  video.id = id;
  video.srcObject = stream;
  video.onloadedmetadata = e => {
    video.play();
  };

  return video;
}
