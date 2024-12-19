import { v4 as uuidv4 } from 'uuid';
import { addUser } from '../models/user.model.js';
import { handleConnection, handleDisconnect, handlerEvent } from './helper.js';
import { createStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';

// 유저가 접근했을 때 처리할 handler
const registerHandler = (io) => {
  io.on('connection', (socket) => {
    // 접속을 했을 때 이벤트
    console.log('A user connected:', socket.id);

    // UUID 생성
    const userUUID = uuidv4();

    if (!userUUID) {
      console.error('Failed to generate userUUID');
      return;
    }

    // 스테이지 초기화 및 유저 추가
    createStage(userUUID);
    console.log('Generated userUUID: ', userUUID);
    addUser({ uuid: userUUID, socketId: socket.id });

    // 유저가 접속했을 때 handle 호출
    handleConnection(socket, userUUID);

    // 클라이언트가 game assets 요청 시 처리
    socket.on('request-game-assets', (callback) => {
      try {
        const assets = getGameAssets(); // assets 폴더에서 모든 자산 로드
        if (typeof callback === 'function') {
          callback({ status: 'success', data: assets });
        }
      } catch (error) {
        console.error('Failed to retrieve game assets:', error.message);
        if (typeof callback === 'function') {
          callback({ status: 'fail', message: 'Failed to retrieve game assets' });
        }
      }
    });

    // 이벤트 처리
    socket.on('event', (data, callback) => {
      handlerEvent(io, socket, data, callback); // 네 번째 인자로 callback 전달
    });

    // 접속 해제 시 이벤트 처리
    socket.on('disconnect', () => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
