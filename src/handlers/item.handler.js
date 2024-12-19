import { getGameAssets } from '../init/assets.js';
import { getItem, setItem } from '../models/item.model.js'; // 아이템 관련 데이터베이스 함수

export const updateScoreHandler = (userId, payload) => {
  try {
    const { clientScore } = payload;

    // 유저 데이터 초기화 (필요 시)
    if (!getItem(userId)) {
      console.warn(`User data not found for userId: ${userId}. Initializing...`);
      setItem(userId, clientScore); // 새로운 유저의 점수 초기화
      return { status: 'success', message: 'User initialized', newScore: clientScore };
    }

    // 기존 유저의 점수 업데이트
    setItem(userId, clientScore);
    // console.log('Updated user data:', getItem(userId));

    return { status: 'success', message: 'Score updated successfully', newScore: clientScore };
  } catch (error) {
    console.error('Error updating score:', error.message);
    return { status: 'fail', message: 'Internal server error' };
  }
};

export const validateItemHandler = (userId, payload) => {
  try {
    console.log('Received userId from client:', userId); // 디버깅 로그 추가
    console.log('validateItemHandler Payload:', payload);

    const assets = getGameAssets();
    const items = assets.items.data || [];
    const itemUnlocks = assets.itemUnlocks.data || [];

    // 클라이언트가 보낸 데이터
    const { itemId, currentStageId, clientScore, timestamp } = payload;

    // 1. 아이템 유효성 검증
    const itemInfo = items.find((item) => item.id === itemId);
    if (!itemInfo) {
      return { status: 'fail', message: '아이템 ID와 일치하지 않습니다.' };
    }

    // 2. 스테이지 유효성 검증
    const stageInfo = itemUnlocks.find((stage) => stage.id === currentStageId);
    console.log('stageInfo : ', stageInfo);
    if (!stageInfo || !stageInfo.unlockedItems.includes(itemId)) {
      return { status: 'fail', message: '스테이지에서 해금되지 않은 아이템을 획득했습니다.' };
    }

    // 3. 점수 및 시간 검증
    const serverTime = Date.now();
    const elapsedTime = (serverTime - timestamp) / 1000; // 경과 시간 계산
    if (elapsedTime < 0 || elapsedTime > 10) {
      return { status: 'fail', message: 'Invalid timestamp or elapsed time' };
    }

    // 서버 기준 점수 계산 (예: 아이템 점수 추가)
    // 4. 서버 기준 점수 계산
    const serverScore = getItem(userId)?.score || 0;
    const expectedScore = serverScore + itemInfo.score; // 예상되는 점수

    console.log('serverScore : ', serverScore);
    console.log('expectedScore : ', expectedScore);

    if (clientScore !== expectedScore) {
      return { status: 'fail', message: 'Score mismatch' };
    }

    // 모든 검증 통과 -> 아이템 획득 처리
    setItem(userId, expectedScore); // 유저 점수 업데이트
    console.log('Item validated successfully:', { userId, itemId, currentStageId });

    return { status: 'success', message: 'Item validated successfully', newScore: expectedScore };
  } catch (error) {
    console.error('Error validating item:', error.message);
    return { status: 'fail', message: 'Internal server error' };
  }
};
