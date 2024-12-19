class Item {
  constructor(ctx, x, y, width, height, id, imageSrc) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.id = id;

    // 이미지 로드
    this.image = new Image();
    this.imageLoaded = false;

    this.image.onload = () => {
      this.imageLoaded = true;
    };

    this.image.src = imageSrc;
  }

  update(gameSpeed, deltaTime) {
    // 아이템이 왼쪽으로 이동
    this.x -= gameSpeed * deltaTime * 0.3;
  }

  draw() {
    if (this.imageLoaded) {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      console.warn(`아직 획득하지 않은 아이템 Id : ${this.id}`);
    }
  }

  collideWith(player) {
    const playerBox = player.getBoundingBox();
    return (
      playerBox.x < this.x + this.width &&
      playerBox.x + playerBox.width > this.x &&
      playerBox.y < this.y + this.height &&
      playerBox.y + playerBox.height > this.y
    );
  }
}

export default Item;
