import Item from './Item.js';
import { requestGameAssets, sendEvent } from './Socket.js';

class ItemController {
  constructor(ctx, scaleRatio, groundSpeed, scoreInstance) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.groundSpeed = groundSpeed;

    this.items = []; // 화면에 표시되는 아이템
    this.itemData = null; // item.json 데이터
    this.itemUnlockData = null; // item_unlock.json 데이터
    this.scoreInstance = scoreInstance; // Score 인스턴스를 가져온다

    // 데이터 로드
    this.loadData();
  }

  async loadData() {
    requestGameAssets((data) => {
      if (data) {
        this.itemData = data.items; // item.json 데이터 저장
        this.itemUnlockData = data.itemUnlocks; // item_unlock.json 데이터 저장
        // Score 인스턴스에 itemData 전달
        if (this.scoreInstance) {
          this.scoreInstance.itemData = this.itemData;
        }
        console.log('Game assets loaded:', { items: this.itemData, unlocks: this.itemUnlockData });
      } else {
        console.error('Failed to load game assets');
      }
    });
  }

  reset() {
    console.log('Resetting ItemController...');
    this.items = []; // 모든 아이템 제거
  }

  getUnlockedItems() {
    const currentStageId = this.scoreInstance?.currentStageId; // Score.js에서 현재 스테이지 ID 가져옴
    if (!this.itemUnlockData || !Array.isArray(this.itemUnlockData.data)) {
      console.error('itemUnlockData is not loaded or invalid:', this.itemUnlockData);
      return [];
    }

    const stageData = this.itemUnlockData.data.find((stage) => stage.id === currentStageId);
    if (!stageData) {
      console.warn(`No stage data found for stageId: ${currentStageId}`);
      return [];
    }

    console.log('Stage data found:', stageData);
    return stageData.unlockedItems || [];
  }

  createItem() {
    if (!this.itemData || !Array.isArray(this.itemData.data)) return;

    const unlockedItems = this.getUnlockedItems(this.currentStageId);
    console.log('unlockItems Check', unlockedItems);
    if (!unlockedItems || unlockedItems.length === 0) {
      console.warn('No unlocked items available for the current stage.');
      return;
    }

    const randomItemId = unlockedItems[Math.floor(Math.random() * unlockedItems.length)];
    const itemInfo = this.itemData.data.find((item) => item.id === randomItemId);

    if (!itemInfo || !itemInfo.width || !itemInfo.height || !itemInfo.image) return;

    const x = this.canvas.width + Math.random() * 200; // 화면 오른쪽 외곽에서 생성
    const canvasHeight = this.canvas?.height || 0;
    const itemHeight = itemInfo?.height || 0;

    // 방어 코드 적용
    const y = Math.random() * (canvasHeight - itemHeight * this.scaleRatio);
    if (isNaN(y)) {
      console.error('Invalid Y value:', { canvasHeight, itemHeight, scaleRatio: this.scaleRatio });
      return;
    }

    const newItem = new Item(
      this.ctx,
      x,
      y,
      itemInfo.width * this.scaleRatio,
      itemInfo.height * this.scaleRatio,
      itemInfo.id,
      itemInfo.image,
    );
    this.items.push(newItem);
  }

  update(gameSpeed, deltaTime) {
    if (!this.itemData || !this.itemUnlockData) return;

    // 일정 시간 간격으로 아이템 생성
    if (Math.random() < 0.005) {
      this.createItem();
    }
    // 아이템 업데이트
    this.items.forEach((item) => item.update(gameSpeed, deltaTime));
    // 화면 밖으로 나간 아이템 제거
    this.items = this.items.filter((item) => item.x > -item.width);
  }

  draw() {
    this.items.forEach((item) => item.draw());
  }

  collideWith(player, scoreInstance) {
    const collidedItemIndex = this.items.findIndex((item) => item.collideWith(player));

    if (collidedItemIndex !== -1) {
      const collidedItem = this.items[collidedItemIndex];
      console.log('Player collided with item:', collidedItem);

      // Score 인스턴스를 통해 아이템 처리 및 서버 검증
      scoreInstance.getItem(collidedItem.id).then((itemScore) => {
        console.log(`Added ${itemScore} points. Current total score: ${scoreInstance.getScore()}`);
      });

      // 충돌한 아이템 제거
      this.items.splice(collidedItemIndex, 1);

      return collidedItem;
    }

    return null;
  }
}

export default ItemController;
