// 다시 한 번 기획한 것을 리마인드
// 유저는 스테이지를 하나씩 올라갈 수 있다.
// 유저는 일정 점수가 되면 다음 스테이지로 넘어간다.

import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';

// 스테이지가 많아질 경우를 대비해서 stage.handler 형태로 파일 디렉토리를 분리
export const moveStageHandler = (userId, payload) => {
  console.log('Payload:', payload);
  // 유저의 현재 stage : curretStage, 다음으로 넘어갈 stage: targetStage
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 오름차순으로 정렬해야한다 왜?
  // 가장 큰 스테이지 ID를 확인 <- 유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1].id;
  const currentStageFromPayload = payload.currentStage;
  console.log('Server current stages:', currentStages);
  console.log('payload:', payload);
  console.log('Client current stage:', currentStageFromPayload);
  // 클라이언트, 서버의 스테이지가 맞는지 비교
  if (currentStage !== currentStageFromPayload) {
    return { status: 'fail', message: 'Current Stage incorrect' };
  }

  // 점수 검증
  // 현재 시간을 체크하는 이유? 점수 계산 기획에서 현재 시간에서 진행 시간만큼 뺀 수 = 점수
  const serverTime = Date.now(); // 현재 타임스탬프
  const elapsedTime = (serverTime - currentStage.timestamp) / 1000;

  // 1스테이지 -> 2스테이지로 넘어가는 과정
  // 5=> 임의로 정한 오차범위
  if (elapsedTime < 10 || elapsedTime > 11) {
    return { status: 'fail', message: 'invalid elapsed time' };
  }

  // targetStage 대한 검증이 필요하하다 <- 게임 에셋이 존재하는가?
  // some이란? 조건문이 하나라도 맞으면 true, 하나라도 맞지 않으면 false를 출력
  const { stages } = getGameAssets();
  const targetStageForm = payload.targetStage;
  if (!stages.data.some((stage) => stage.id === targetStageForm)) {
    return { status: 'fail', message: 'Target stage not found' };
  }

  // 모든 검증 절차를 완료했을 때 게임이 시작
  setStage(userId, targetStageForm, serverTime);
  console.log('Setting new stage for user:', targetStageForm);
  return { status: 'success' };
};
