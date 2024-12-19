import { getHighScore, setHighScore } from '../models/highscore.model.js';

let globalHighScore = { userId: null, score: 0 }; // 전체 플레이어의 최고 점수 저장

// 개인 최고 기록 제출 핸들러
export const submitHighScoreHandler = (userId, payload) => {
  const { score } = payload;

  // 현재 글로벌 최고 점수 확인 및 갱신
  if (score > globalHighScore.score) {
    globalHighScore = { userId, score };
    console.log(`New global high score by ${userId}: ${score}`);

    return {
      status: 'success',
      message: 'New global high score!',
      broadcast: true,
      userId,
      score,
    };
  }

  return {
    status: 'success',
    message: 'Personal high score updated.',
    broadcast: false,
    userId,
    score,
  };
};

// 전체 최고 기록 조회 핸들러
export const getGlobalHighScoreHandler = (userId) => {
  return {
    status: 'success',
    message: 'Global high score retrieved.',
    data: globalHighScore,
  };
};
