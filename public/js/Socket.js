// import { io } from 'socket.io-client';
import { CLIENT_VERSION } from './Constants.js';

// 클라이언트 버전 체크!
const socket = io('http://localhost:3000', {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userId = null;

socket.on('response', (data) => {
  console.log('response : ', data);
});

socket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
});

const sendEvent = (handlerId, payload, callback) => {
  socket.emit(
    'event',
    {
      userId,
      clientVersion: CLIENT_VERSION,
      handlerId,
      payload,
    },
    (response) => {
      console.log('Received response from server:', response); // 디버깅 로그 추가
      if (callback) callback(response); // 클라이언트 콜백 호출
    },
  );
};

// const sendEvent = (handlerId, payload, callback) => {
//   socket.emit('event', {
//     userId,
//     clientVersion: CLIENT_VERSION,
//     handlerId,
//     payload,
//   });
// };

export { socket, sendEvent };
