const highScores = {}; // 메모리에 사용자별 최고 점수 저장

export const getHighScore = (userId) => {
  return highScores[userId] || 0; // 해당 유저의 최고 점수 반환 (없으면 0)
};

export const setHighScore = (userId, score) => {
  highScores[userId] = score; // 유저의 새로운 최고 점수 저장
};
