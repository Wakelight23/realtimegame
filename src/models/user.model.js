const users = [];

// 유저가 접속했는지 확인하는 함수 111
// 유저 추가
export const addUser = (user) => {
  if (!user.uuid || !user.socketId) {
    console.error('Invalid user data:', user);
    return;
  }
  users.push(user);
};

// 유저가 접속을 해제할 때 사용하는 함수
export const removeUser = (socketId) => {
  const index = users.findIndex((user) => user.socketId === socketId);
  if (index !== -1) {
    return users.splice(index, 1)[0]; // 삭제된 유저 반환
  }
  console.warn(`User with socketId ${socketId} not found`);
  return null;
};

// 유저가 접속했는지 확인하는 함수 222
export const getUser = () => {
  return users;
};
