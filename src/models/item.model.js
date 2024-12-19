let userItems = {}; // 간단한 메모리 저장소

export const getItem = (uuid) => {
  return userItems[uuid] || null;
};

export const setItem = (uuid, score) => {
  if (!userItems[uuid]) {
    userItems[uuid] = { score };
  } else {
    userItems[uuid].score = score;
  }
};
