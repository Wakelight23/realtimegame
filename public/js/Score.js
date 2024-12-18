import { sendEvent } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;
  currentStageId = 1000; // 초기 스테이지 ID (stage.json의 첫 번째 ID)
  userId = null; // 유저 ID 저장
  isLastStage = false; // 마지막 스테이지 여부 플래그

  constructor(ctx, scaleRatio) {
    this.socket = io();
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.stageChange = true;

    this.initUser();
  }

  initUser() {
    const socket = io(); // Socket.io 연결

    // 서버로부터 userId 수신
    socket.on('connection', (data) => {
      this.userId = data.uuid; // 서버에서 받은 userId 저장
      console.log('Initialized user with ID:', this.userId);
    });
  }

  // TargetScore를 stage.json에서 데이터를 가져온다
  // 현재 비동기 처리
  async getTargetScore(stageId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('request-game-assets', (response) => {
        if (response.status === 'success') {
          const stage = response.data.stages?.data?.find((s) => s.id === stageId);
          if (!stage) {
            console.error(`Stage with ID ${stageId} not found`);
            resolve(null); // 해당 스테이지가 없으면 null 반환
          } else {
            resolve(stage.score); // 스테이지의 목표 점수 반환
          }
        } else {
          console.error('Failed to fetch target score:', response.message);
          reject(null);
        }
      });
    });
  }

  async getStageData(stageId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('request-game-assets', (response) => {
        if (response.status === 'success') {
          const allStages = response.data.stages?.data || [];
          const currentStage = allStages.find((s) => s.id === stageId);
          if (!currentStage) {
            console.error(`Stage with ID ${stageId} not found`);
            resolve({ allStages }); // 모든 스테이지 데이터를 반환
          } else {
            resolve({ ...currentStage, allStages }); // 현재 스테이지와 전체 스테이지 반환
          }
        } else {
          console.error('Failed to fetch stage data:', response.message);
          reject(null);
        }
      });
    });
  }

  // 일정 점수가 될 때 스테이지가 변경되는 로직
  async update(deltaTime) {
    if (!this.userId) return; // userId가 없으면 업데이트 중단

    // 점수 증가
    this.score += deltaTime * 0.001;
    // 현재 스테이지의 목표 점수를 가져옴
    try {
      const stageData = await this.getStageData(this.currentStageId); // 현재 스테이지 데이터 가져오기

      if (!stageData) {
        console.error('Stage data is null. Cannot proceed.');
        return;
      }

      const { score: targetScore, scorePerSecond } = stageData;

      // 점수 증가 (스테이지별 scorePerSecond를 반영)
      this.score += deltaTime * 0.001 * scorePerSecond;

      // console.log('Current Stage ID:', this.currentStageId);
      // console.log('Current Score:', this.score);
      // console.log('Target Score:', targetScore);
      // console.log('Stage Change Flag:', this.stageChange);

      // 마지막 스테이지인지 확인
      const allStages = stageData.allStages || []; // 전체 스테이지 목록 가져오기
      const isLastStage = !allStages.some((stage) => stage.id === this.currentStageId + 1);
      this.isLastStage = isLastStage;

      // 마지막 Stage라면
      if (isLastStage) {
        console.log('This is the last stage. Continuing...');
        return; // 다음 단계로 이동하지 않고 점수 증가만 유지
      }

      // 목표 점수에 도달하고 stageChange 플래그가 true일 때 다음 스테이지로 이동
      if (this.score >= targetScore && this.stageChange) {
        console.log('Condition met: Moving to next stage');
        this.stageChange = false; // 플래그 비활성화

        sendEvent(
          11,
          { currentStage: this.currentStageId, targetStage: this.currentStageId + 1 },
          (response) => {
            if (response.status === 'success') {
              console.log('Successfully moved to the next stage!');
              this.currentStageId += 1; // 다음 스테이지로 이동
            } else {
              console.error('Failed to move to the next stage:', response.message);
            }
            this.stageChange = true; // 다시 요청 가능하도록 플래그 초기화
          },
        );
      }
    } catch (error) {
      console.error('Error in update function:', error); // 에러 핸들링 추가
    }
  }

  getItem(itemId) {
    this.score += 1;
  }

  reset() {
    this.score = 0;
    this.currentStageId = 1000; // 초기화 시 첫 번째 스테이지로 돌아감
    this.isLastStage = false; // 플래그 초기화
  }

  // 현재 코드는 localStorage에만 highscore가 저장중
  // -> 기록이 가능해야하며 다른 접속자가 볼 수 있어야 함함
  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
