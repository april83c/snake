export interface Vector2 {
	x: number;
	y: number;
}

export enum SnakeState {
	Running = 0,
	Dead = 1
}

export default class Snake {
	state: SnakeState;

	boardSize: Vector2;
	apples: Vector2[];

	snake: Vector2[];
	snakeVelocity: Vector2;
	
	constructor(boardSize: Vector2, apples: number = 1) {
		this.state = SnakeState.Running;
		this.boardSize = boardSize;

		this.snake = [{
			x: Math.floor(this.boardSize.x / 2),
			y: Math.floor(this.boardSize.y / 2)
		}];
		this.snakeVelocity = { x: 1, y: 0 };

		this.apples = [];
		for (let i = 0; i < apples; i++) {
			this.apples.push(this.getValidApplePosition());
		}
	}

	tick(input: Vector2 | undefined) {
		// are we dead
		if (this.state != SnakeState.Running) return;

		// validate input
		if (input != undefined) {
			input.x = Math.round(input.x);
			input.y = Math.round(input.y);
			if (input.x != 0 && input.y != 0) throw new Error('Invalid input');
			if (input.x > 1 || input.x < -1 || input.y > 1 || input.y < -1) throw new Error('Invalid input');

			this.snakeVelocity = 
				(input.x == 0 && input.y == 0) || // If the input is nothing
				(input.x == this.snakeVelocity.x * -1 && input.y == this.snakeVelocity.y * -1) // Or if the input is a 180 flip
				? this.snakeVelocity : input; // Then just keep our existing velocity
		}
		
		// move snake and check collision
		const newPosition = {
			x: this.snake[0].x + this.snakeVelocity.x,
			y: this.snake[0].y + this.snakeVelocity.y
		};

		if ((this.snake.findIndex(snakePiece => snakePiece.x == newPosition.x && snakePiece.y == newPosition.y) != -1)) { // Check if snake colliding with itself
			this.snake.unshift(newPosition);
			this.state = SnakeState.Dead;
			return;
		} else if ((newPosition.x >= this.boardSize.x || newPosition.x < 0 || newPosition.y >= this.boardSize.y || newPosition.y < 0) ) { // Check if we are out of bounds
			this.state = SnakeState.Dead;
			return;
		} else {
			this.snake.unshift(newPosition);
		}
		
		// check for apples
		const appleIndex = this.apples.findIndex(apple => apple.x == this.snake[0].x && apple.y == this.snake[0].y);
		if (appleIndex != -1) {
			this.apples.splice(appleIndex, 1);
			this.apples.push(this.getValidApplePosition());
		} else {
			this.snake.pop();
		}
	}

	private getValidApplePosition() {
		let position: Vector2 = this.snake[0];
		while (this.snake.findIndex(piece => piece.x == position.x && piece.y == position.y) != -1 || this.apples.findIndex(apple => apple.x == position.x && apple.y == position.y) != -1) {
			position = {
				x: Math.floor(Math.random() * this.boardSize.x),
				y: Math.floor(Math.random() * this.boardSize.y)
			}
		}
		return position;
	}
}