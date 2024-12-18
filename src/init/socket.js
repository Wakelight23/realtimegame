import { Socket, Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';

const initServer = (server) => {
  const io = new SocketIO();
  io.attach(server);

  registerHandler(io);
};

export default initServer;
