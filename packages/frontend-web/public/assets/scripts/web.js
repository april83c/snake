// ../../node_modules/@april83c/snake/src/snake.ts
var SnakeState;
(function(SnakeState2) {
  SnakeState2[SnakeState2["Running"] = 0] = "Running";
  SnakeState2[SnakeState2["Dead"] = 1] = "Dead";
})(SnakeState || (SnakeState = {}));

class Snake {
  state;
  boardSize;
  apples;
  snake;
  snakeVelocity;
  constructor(boardSize, apples = 1) {
    this.state = SnakeState.Running;
    this.boardSize = boardSize;
    this.snake = [{
      x: Math.floor(this.boardSize.x / 2),
      y: Math.floor(this.boardSize.y / 2)
    }];
    this.snakeVelocity = { x: 1, y: 0 };
    this.apples = [];
    for (let i = 0;i < apples; i++) {
      this.apples.push(this.getValidApplePosition());
    }
  }
  tick(input) {
    if (this.state != SnakeState.Running)
      return;
    if (input != null) {
      input.x = Math.round(input.x);
      input.y = Math.round(input.y);
      if (input.x != 0 && input.y != 0)
        throw new Error("Invalid input");
      if (input.x > 1 || input.x < -1 || input.y > 1 || input.y < -1)
        throw new Error("Invalid input");
      this.snakeVelocity = input.x == 0 && input.y == 0 || input.x == this.snakeVelocity.x * -1 && input.y == this.snakeVelocity.y * -1 ? this.snakeVelocity : input;
    }
    const newPosition = {
      x: this.snake[0].x + this.snakeVelocity.x,
      y: this.snake[0].y + this.snakeVelocity.y
    };
    if (this.snake.findIndex((snakePiece) => snakePiece.x == newPosition.x && snakePiece.y == newPosition.y) != -1) {
      this.snake.unshift(newPosition);
      this.state = SnakeState.Dead;
      return;
    } else if (newPosition.x >= this.boardSize.x || newPosition.x < 0 || newPosition.y >= this.boardSize.y || newPosition.y < 0) {
      this.state = SnakeState.Dead;
      return;
    } else {
      this.snake.unshift(newPosition);
    }
    const appleIndex = this.apples.findIndex((apple) => apple.x == this.snake[0].x && apple.y == this.snake[0].y);
    if (appleIndex != -1) {
      this.apples.splice(appleIndex, 1);
      this.apples.push(this.getValidApplePosition());
    } else {
      this.snake.pop();
    }
  }
  getValidApplePosition() {
    let position = this.snake[0];
    while (this.snake.findIndex((piece) => piece.x == position.x && piece.y == position.y) != -1 || this.apples.findIndex((apple) => apple.x == position.x && apple.y == position.y) != -1) {
      position = {
        x: Math.floor(Math.random() * this.boardSize.x),
        y: Math.floor(Math.random() * this.boardSize.y)
      };
    }
    return position;
  }
}

// src/web.ts
class WebSnake {
  game;
  inputBuffer;
  minimumTickLength;
  lastTickStarted;
  mainView;
  mainViewContext;
  mainViewTileSize;
  mainViewOffset;
  constructor(doc, mainView) {
    this.game = new Snake({ x: 30, y: 15 }, 5);
    this.minimumTickLength = 64;
    this.lastTickStarted = Date.now() - this.minimumTickLength;
    this.mainView = mainView;
    const context = this.mainView.getContext("2d");
    if (context === null) {
      throw new Error("Couldn\'t get main view canvas context.");
    } else {
      this.mainViewContext = context;
      context.save();
    }
    this.mainViewTileSize = 1;
    this.mainViewOffset = { x: 0, y: 0 };
    const resizeHandler = () => {
      this.mainView.width = this.mainView.clientWidth;
      this.mainView.height = this.mainView.clientHeight;
      this.mainViewTileSize = Math.floor(Math.min(this.mainView.width / this.game.boardSize.x, this.mainView.height / this.game.boardSize.y));
      this.mainViewOffset.x = Math.floor((this.mainView.width - this.mainViewTileSize * this.game.boardSize.x) / 2);
      this.mainViewOffset.y = Math.floor((this.mainView.height - this.mainViewTileSize * this.game.boardSize.y) / 2);
      this.render();
    };
    resizeHandler();
    const observer = new ResizeObserver(resizeHandler);
    observer.observe(this.mainView);
    this.inputBuffer = [];
    doc.addEventListener("keydown", (event) => {
      let handled = false;
      if (event.key !== undefined) {
        switch (event.key) {
          case "ArrowLeft":
            handled = true;
            this.inputBuffer.push({ x: -1, y: 0 });
            break;
          case "ArrowUp":
            handled = true;
            this.inputBuffer.push({ x: 0, y: -1 });
            break;
          case "ArrowRight":
            handled = true;
            this.inputBuffer.push({ x: 1, y: 0 });
            break;
          case "ArrowDown":
            handled = true;
            this.inputBuffer.push({ x: 0, y: 1 });
            break;
        }
      } else if (event.keyCode !== undefined) {
        switch (event.keyCode) {
          case 37:
            handled = true;
            this.inputBuffer.push({ x: -1, y: 0 });
            break;
          case 38:
            handled = true;
            this.inputBuffer.push({ x: 0, y: -1 });
            break;
          case 39:
            handled = true;
            this.inputBuffer.push({ x: 1, y: 0 });
            break;
          case 40:
            handled = true;
            this.inputBuffer.push({ x: 0, y: 1 });
            break;
        }
      }
      if (handled)
        event.preventDefault();
    });
    this.mainLoop();
  }
  mainLoop() {
    const tickStarted = Date.now();
    const framesToRun = Math.max(1, (tickStarted - this.lastTickStarted) / this.minimumTickLength);
    for (let i = 1;i < framesToRun; i++)
      if (this.game.state == SnakeState.Running)
        this.game.tick(this.inputBuffer.shift());
    this.render();
    this.lastTickStarted = tickStarted;
    setTimeout(() => {
      this.mainLoop();
    }, Math.max(0, this.minimumTickLength - (Date.now() - tickStarted)));
  }
  render() {
    this.mainViewContext.restore();
    this.mainViewContext.fillStyle = `#333333`;
    this.mainViewContext.fillRect(this.mainViewOffset.x, this.mainViewOffset.y, this.mainViewTileSize * this.game.boardSize.x, this.mainViewTileSize * this.game.boardSize.y);
    for (let row = 0;row < this.game.boardSize.y; row++) {
      for (let column = 0;column < this.game.boardSize.x; column++) {
        const snakeIndex = this.game.snake.findIndex((snakePiece) => snakePiece.x == column && snakePiece.y == row);
        if (snakeIndex != -1) {
          if (snakeIndex == 0)
            this.mainViewContext.fillStyle = "green";
          else
            this.mainViewContext.fillStyle = "darkGreen";
        } else if (this.game.apples.find((apple) => apple.x == column && apple.y == row)) {
          this.mainViewContext.fillStyle = "red";
        } else {
          continue;
        }
        this.mainViewContext.fillRect(this.mainViewOffset.x + column * this.mainViewTileSize, this.mainViewOffset.y + row * this.mainViewTileSize, this.mainViewTileSize, this.mainViewTileSize);
      }
    }
  }
}
var instance;
window.onload = () => {
  const mainView = document.getElementById("mainView");
  if (mainView instanceof HTMLCanvasElement)
    instance = new WebSnake(document, mainView);
};
