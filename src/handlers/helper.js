import { CLIENT_VERSION } from '../constants.js';
import { getUser, removeUser } from '../models/user.model.js';
import handlerMappings from './handlerMapping.js';

export const handleDisconnect = (socket, userUUID) => {
  removeUser(socket.id);
  console.log(`User disconnected: ${socket.id}`);
  console.log(`Current users: `, getUser());
};

// 다시 한 번 기획을 했던 것을 remind
// 스테이지 따라서 더 높은 점수 획득
// 1스테이지, 0점 -> 1점씩
// 2스테이지, 1000점 -> 2점씩
export const handleConnection = (socket, uuid) => {
  console.log(`New user connected: ${uuid} with socket ID ${socket.id}`);
  console.log(`Cuerrent users: `, getUser());

  socket.emit('connection', { uuid: uuid });
};

// 여기서 data = payload
export const handlerEvent = (io, socket, data, callback) => {
  console.log('Received data from client:', data);
  // 클라이언트 버전이 공통적으로 작성된 데이터 테이블의 정보와 맞지 않는다면
  // 클라이언트 버전이 맞지 않을 때 에러 처리
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', { status: 'fail', message: 'Client version incorrect!' });
    return;
  }

  // handler가 없을 때 에러 처리
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    const errorResponse = { status: 'fail', message: 'Handler not found' };
    console.log('Error response sent to client:', errorResponse);
    callback(errorResponse); // 클라이언트의 콜백 호출
    return;
  }

  const response = handler(data.userId, data.payload);
  console.log('Handler response:', response);

  callback(response); // 클라이언트의 콜백 호출

  // // 모든 유저에게 보내야 한다면 broadcast 사용
  // if (response.broadcast) {
  //   io.emit('response', 'broadcast');
  //   return;
  // }

  // // response가 정상적으로 끝났다면
  // socket.emit('response', response);
};
