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

// 서버로부터 브로드캐스트된 신기록 수신
socket.on('broadcast-high-score', (data) => {
  console.log(`New high score by ${data.userId}: ${data.score}`);
});

export const requestGameAssets = (callback) => {
  socket.emit('request-game-assets', (response) => {
    if (response && response.status === 'success') {
      callback(response.data); // 성공적으로 데이터를 반환
    } else {
      console.error('Failed to fetch game assets:', response?.message || 'Unknown error');
      callback(null); // 실패 시 null 전달
    }
  });
};

export const validateItem = (payload, callback) => {
  socket.emit('validate-item', payload, (response) => {
    if (response.status === 'success') {
      console.log('Item validated successfully:', response);
      callback(response);
    } else {
      console.error('Failed to validate item:', response.message);
      callback(null);
    }
  });
};

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
      if (callback) callback(response); // 클라이언트 콜백 호출
    },
  );
};

export { socket, sendEvent };
