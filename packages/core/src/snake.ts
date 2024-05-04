export interface Vector2 {
	x: number;
	y: number;
}

export enum SnakeState {
	Running = 0,
	DeadByBody = 1,
	DeadByOutOfBounds = 2
}

export type SnakeStateCallback = (snakeState: SnakeState, snake: Snake) => any | undefined;

export default class Snake {
	private _state: SnakeState;
	stateCallback: SnakeStateCallback;

	public get state() {
		return this._state
	}
	public set state(newState) {
		this._state = newState;
		if (this.stateCallback != undefined) this.stateCallback(newState, this);
	}

	boardSize: Vector2;
	apples: Vector2[];

	snake: Vector2[];
	snakeVelocity: Vector2;
	
	// Careful: stateCallback is not called when the state is initially set to SnakeState.Running, so it shouldn't be used like a "on ready"! Instead, the constructor being finished should be used as a "on ready".
	constructor(boardSize: Vector2, apples: number = 1, stateCallback: SnakeStateCallback) {
		// input validation
		if (isNaN(apples)) throw new Error('Apple count is NaN');
		if (boardSize.x < 1 || boardSize.y < 1) throw new Error('Board size should be at least 1 in each axis');
		// Max apple count is already validated by getValidApplePosition(), see below

		this._state = SnakeState.Running;
		this.stateCallback = stateCallback;
		this.boardSize = { x: Math.round(boardSize.x), y: Math.round(boardSize.y) };

		this.snake = [{
			x: Math.floor(this.boardSize.x / 2),
			y: Math.floor(this.boardSize.y / 2)
		}];
		this.snakeVelocity = { x: 1, y: 0 };

		this.apples = [];
		for (let i = 0; i < apples; i++) {
			const apple = this.getValidApplePosition();
			if (apple === false) throw new Error('Too many apples for this board size!');
			this.apples.push(apple);
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
			this.state = SnakeState.DeadByBody;
			return;
		} else if ((newPosition.x >= this.boardSize.x || newPosition.x < 0 || newPosition.y >= this.boardSize.y || newPosition.y < 0) ) { // Check if we are out of bounds
			this.state = SnakeState.DeadByOutOfBounds;
			return;
		} else {
			this.snake.unshift(newPosition);
		}
		
		// check for apples
		const appleIndex = this.apples.findIndex(apple => apple.x == this.snake[0].x && apple.y == this.snake[0].y);
		if (appleIndex != -1) {
			this.apples.splice(appleIndex, 1);
			const apple = this.getValidApplePosition()
			if (apple !== false) this.apples.push(apple);
		} else {
			this.snake.pop();
		}
	}

	private getValidApplePosition() {
		if (((this.boardSize.x * this.boardSize.y) - this.apples.length - this.snake.length) < 1) return false;

		// FIXME: Should we instead construct an array of every possible apple position and select randomly from its length? Or would that be worse on performance?
		let position: Vector2;
		do {
			position = {
				x: Math.floor(Math.random() * this.boardSize.x),
				y: Math.floor(Math.random() * this.boardSize.y)
			}
		} while (this.snake.findIndex(piece => piece.x == position.x && piece.y == position.y) != -1 || this.apples.findIndex(apple => apple.x == position.x && apple.y == position.y) != -1)
		return position;
	}
}