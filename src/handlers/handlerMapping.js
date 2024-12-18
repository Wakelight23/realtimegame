// 그럼 id에 맞는 handler를 가져와야하는데
// 그에 대한 handler를 가져올 Mapping을 할 handlr가 필요할 것

import { gameEnd, gameStart } from './game.handler.js';
import { moveStageHandler } from './stage.handler.js';

export const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
};

export default handlerMappings;
