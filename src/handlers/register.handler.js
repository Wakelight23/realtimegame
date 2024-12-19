import { v4 as uuidv4 } from 'uuid';
import { addUser } from '../models/user.model.js';
import { handleConnection, handleDisconnect, handlerEvent } from './helper.js';
import { createStage } from '../models/stage.model.js';
import { getGameAssets } from '../init/assets.js';
import { getHighScore, setHighScore } from '../models/highscore.model.js';

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

    // 신기록 제출 이벤트 처리
    socket.on('submit-high-score', (data, callback) => {
      const { userId, score } = data;

      // 현재 최고 점수 확인 및 갱신
      const currentHighScore = getHighScore(userId);
      if (score > currentHighScore) {
        setHighScore(userId, score); // 새로운 최고 점수 저장

        console.log(`New high score by ${userId}: ${score}`);

        // 모든 클라이언트에게 브로드캐스트
        io.emit('broadcast-high-score', { userId, score });

        // 성공 응답 반환
        callback({ status: 'success', message: 'High score updated successfully' });
      } else {
        // 기존 점수가 더 높을 경우 실패 응답 반환
        callback({ status: 'fail', message: 'Score is not higher than the current high score' });
      }
    });

    // 접속 해제 시 이벤트 처리
    socket.on('disconnect', () => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
