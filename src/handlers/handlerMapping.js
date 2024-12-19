// 그럼 id에 맞는 handler를 가져와야하는데
// 그에 대한 handler를 가져올 Mapping을 할 handlr가 필요할 것

import { gameEnd, gameStart } from './game.handler.js';
import { moveStageHandler } from './stage.handler.js';
import { validateItemHandler, updateScoreHandler } from './item.handler.js';

export const handlerMappings = {
  2: gameStart, // 게임이 시작할 대 핸들러
  3: gameEnd, // 게임이 끝날 때 처리 핸들러
  11: moveStageHandler, // 다음 스테이지로 가는 핸들러
  21: validateItemHandler,
  22: updateScoreHandler, // 점수 업데이트 핸들러
};

export default handlerMappings;
