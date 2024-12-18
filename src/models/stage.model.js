// key: uuid, value: array -> stage 정보는 복수로 가져올 수 있기 때문에 배열로 설정

const stages = {};

// 스테이지 초기화
export const createStage = (uuid) => {
  if (!stages[uuid]) {
    stages[uuid] = [];
  }
};

// 사용자 스테이지 가져오기
export const getStage = (uuid) => {
  return stages[uuid] || [];
};

// 사용자 스테이지 업데이트
export const setStage = (uuid, id, timestamp) => {
  if (!stages[uuid]) {
    createStage(uuid);
  }
  stages[uuid].push({ id, timestamp });
};

// 사용자 스테이지 삭제
export const clearStage = (uuid) => {
  delete stages[uuid];
};
