// 게임을 시작할 때 사용하는 handler
import { getGameAssets } from '../init/assets.js';
import { setStage, getStage, clearStage } from '../models/stage.model.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();

  // 게임 기록 초기화
  clearStage(uuid);

  // stages 배열에서 0번째 = 첫 번째 스테이지
  setStage(uuid, stages.data[0].id, payload.timestamp);
  console.log('Stage : ', getStage(uuid));

  return { status: 'success' };
};

export const gameEnd = () => {
  // 클라이언트는 게임 종료 시 타임스탬프와 총 점수를 전달해줄 것이다
  const { timestamp: gameEndTime, score } = payload;
  // 총 점수
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 각 스테이지의 지속시간을 계산하여 총 점수 계산
  let totalScore = 0;

  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      stageEndTime = gameEndTime;
    } else {
      stageEndTime = stages[index + 1].timestamp;
    }

    // 스테이지에서 얼마나 머무르고 있었는가
    const stageDuration = (stageEndTime - stage.timestamp) / 100;
    totalScore += stageDuration; // 1초당 1점
  });

  // 점수와 타임스탬프 검증
  // 오차범위 설정해서 서버와 클라이언트가 통신할 때 생기는 간극의 에러 처리
  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', message: 'Score verification failed' };
  }

  // DB에 저장한다고 하면
  // 저장 코드 작성
  // Record, 게임 플레이 내역을 저장할 테이블

  return { status: 'success', message: 'Game Over', score };
};
