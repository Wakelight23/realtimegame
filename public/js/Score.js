import { sendEvent, requestGameAssets } from './Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;
  userId = null; // 유저 ID 저장
  isLastStage = false; // 마지막 스테이지 여부 플래그

  constructor(ctx, scaleRatio) {
    this.socket = io();
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.stageChange = true;
    this.currentStageId = 1000; // 초기 스테이지 ID (stage.json의 첫 번째 ID)

    this.isFetchingItem = {}; // 아이템이 중복으로 획득되는지 체크용 객체

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
      requestGameAssets((data) => {
        if (data) {
          const stage = data.stages?.data?.find((s) => s.id === stageId);
          if (!stage) {
            console.error(`Stage with ID ${stageId} not found`);
            resolve(null);
          } else {
            resolve(stage.score);
          }
        } else {
          console.error('Failed to fetch target score.');
          reject(null);
        }
      });
    });
  }

  async getStageData(stageId) {
    return new Promise((resolve, reject) => {
      requestGameAssets((data) => {
        if (data) {
          const allStages = data.stages?.data || [];
          const currentStage = allStages.find((s) => s.id === stageId);
          if (!currentStage) {
            console.error(`Stage with ID ${stageId} not found`);
            resolve({ allStages });
          } else {
            resolve({ ...currentStage, allStages });
          }
        } else {
          console.error('Failed to fetch stage data.');
          reject(null);
        }
      });
    });
  }

  async getItem(itemId) {
    if (this.isFetchingItem[itemId]) {
      console.warn(`중복 요청된 ID: ${itemId}`);
      return; // 중복 요청 방지
    }

    this.isFetchingItem[itemId] = true;

    return new Promise((resolve, reject) => {
      requestGameAssets((data) => {
        this.isFetchingItem[itemId] = false; // 플래그 해제

        if (data) {
          const itemData = data.items?.data?.find((item) => item.id === itemId);
          if (!itemData) {
            console.warn(`Item with ID ${itemId} not found.`);
            resolve(0);
          } else {
            this.score += itemData.score; // 아이템 점수 추가

            // 서버에 검증 요청
            const payload = {
              userId: this.userId,
              currentStageId: this.currentStageId,
              clientScore: this.score,
              itemId,
              timestamp: Date.now(),
            };

            sendEvent(21, payload, (response) => {
              if (response.status === 'success') {
                console.log('Item validated successfully:', response);
                this.score = response.newScore; // 서버에서 반환된 최신 점수로 동기화
                resolve(itemData.score);
              } else {
                console.error('Failed to validate item:', response.message);
                reject(0);
              }
            });
          }
        } else {
          console.error('Failed to fetch item data.');
          reject(0);
        }
      });
    });
  }

  getScore() {
    return this.score;
  }

  // 일정 점수가 될 때 스테이지가 변경되는 로직
  async update(deltaTime) {
    if (!this.userId) return; // userId가 없으면 업데이트 중단

    // 스테이지 데이터 가져오기
    const stageData = await this.getStageData(this.currentStageId);
    if (!stageData) {
      console.error('Stage data is null. Cannot proceed.');
      return;
    }

    const { score: targetScore, scorePerSecond } = stageData;

    // 시간당 점수 증가
    this.score += deltaTime * 0.001 * scorePerSecond;

    // 서버에 점수 검증 요청
    const payload = {
      userId: this.userId,
      currentStageId: this.currentStageId,
      clientScore: this.score,
      timestamp: Date.now(),
    };

    sendEvent(22, payload, (response) => {
      if (response.status === 'success') {
        this.score = response.newScore; // 서버에서 반환된 최신 점수로 동기화
      } else {
        console.error('Failed to update score on server:', response.message);
      }
    });

    // 마지막 스테이지 여부 확인
    const allStages = stageData.allStages || [];
    const isLastStage = !allStages.some((stage) => stage.id === this.currentStageId + 1);
    this.isLastStage = isLastStage;

    if (isLastStage) {
      console.log('This is the last stage. Continuing...');
      return; // 마지막 스테이지에서는 더 이상 진행하지 않음
    }

    // 목표 점수 도달 시 스테이지 변경
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

  updateScore(newScore) {
    console.log('Updating score:', newScore);
    this.score = newScore;
  }

  getCurrentStageId() {
    return this.currentStageId;
  }

  setCurrentStageId(stageId) {
    this.currentStageId = stageId; // 현재 스테이지 ID 업데이트
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
