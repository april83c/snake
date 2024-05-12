import Snake, { SnakeState, type SnakeStateCallback, type Vector2 } from '@april83c/snake';
import type { AppleSkin, FieldSkin, SnakeSkin } from './Skin';
import { SnakePiece, SnakeSkinPrototype, AppleSkinPrototype } from './Skin';

export enum WebSnakeState {
	Stopped = 0,
	Paused = 1,
	Running = 2
}

export interface Locker {
	snake: SnakeSkin;
	apple: AppleSkin;
}

export default class WebSnake {
	state: WebSnakeState;
	debugEnabled: boolean;
	debug: string[];

	smoothingEnabled: boolean;
	skins: Locker;

	game: Snake;
	previousTickSnakeEnd: Vector2 | null; // for smooth snake
	previousTickState: SnakeState;
	inputBuffer: Vector2[];

	minimumTickLength: number;
	lastTickStarted: number;

	lastFrameTime: number;

	readonly mainView: HTMLCanvasElement;
	readonly mainViewContext: CanvasRenderingContext2D;
	mainViewTileSize: number;
	mainViewFontSize: number;
	mainViewOffset: Vector2;

	scoreElement: HTMLSpanElement;
	clockElement: HTMLSpanElement;

	constructor(doc: Document, mainView: HTMLCanvasElement, score: HTMLSpanElement, clock: HTMLSpanElement, tickLength: number, smoothingEnabled: boolean, locker: Locker, snake: Snake) {
		this.state = WebSnakeState.Running;
		this.debugEnabled = false;
		this.debug = [];

		this.smoothingEnabled = smoothingEnabled;
		this.skins = locker;

		this.game = snake;
		this.previousTickSnakeEnd = this.game.snake[this.game.snake.length];
		this.previousTickState = this.game.state;

		this.minimumTickLength = tickLength;
		this.lastTickStarted = performance.now() - this.minimumTickLength;

		this.lastFrameTime = 0;

		// Set up main view
		this.mainView = mainView;
		const context: CanvasRenderingContext2D | null = this.mainView.getContext('2d');
		if (context === null) {
			throw new Error('Couldn\'t get main view canvas context.');
		} else {
			this.mainViewContext = context;
		}

		// Observe main view size
		this.mainViewTileSize = 2;
		this.mainViewFontSize = 1;
		this.mainViewOffset = { x: 0, y: 0 };

		const resizeHandler = () => {
			this.mainView.width = this.mainView.clientWidth;
			this.mainView.height = this.mainView.clientHeight;

			this.mainViewTileSize = Math.floor(Math.min(
				this.mainView.width / this.game.boardSize.x,
				this.mainView.height / this.game.boardSize.y
			));
			this.mainViewFontSize = this.mainViewTileSize / 2;
			this.mainViewContext.font = `${this.mainViewFontSize}px system-ui`;

			this.mainViewOffset.x = Math.floor((this.mainView.width - (this.mainViewTileSize * this.game.boardSize.x)) / 2);
			this.mainViewOffset.y = Math.floor((this.mainView.height - (this.mainViewTileSize * this.game.boardSize.y)) / 2);

			this.render(0, 0);
		}
		resizeHandler();

		const observer = new ResizeObserver(resizeHandler);
		observer.observe(this.mainView);

		// Listen for input
		this.inputBuffer = [];
		const inputListener = (event: KeyboardEvent): void => {
			if (this.state == WebSnakeState.Stopped) return doc.removeEventListener('keydown', inputListener);
			let handled = false;

			if (event.key !== undefined) {
				switch(event.key) {
					case 'ArrowLeft':
						handled = true;
						this.inputBuffer.push({ x: -1, y: 0 });
						break;
					case 'ArrowUp':
						handled = true;
						this.inputBuffer.push({ x: 0, y: -1 });
						break;
					case 'ArrowRight':
						handled = true;
						this.inputBuffer.push({ x: 1, y: 0 });
						break;
					case 'ArrowDown':
						handled = true;
						this.inputBuffer.push({ x: 0, y: 1 });
						break;
					case '=':
						handled = true;
						this.debugEnabled = !this.debugEnabled;
						if (!this.debugEnabled) this.debug = [];
						break;
				}
			} else if (event.keyCode !== undefined) {
				switch(event.keyCode) {
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
					case 61:
						handled = true;
						this.debugEnabled = !this.debugEnabled;
						if (!this.debugEnabled) this.debug = [];
						break;
				}
			}

			if (handled) event.preventDefault();
		};
		doc.addEventListener('keydown', inputListener)

		this.scoreElement = score;
		this.clockElement = clock;

		this.mainLoop(performance.now());
	}

	mainLoop(lastFrameEnded: number) {
		const delta = Math.max(performance.now() - lastFrameEnded, 0);
		let frameStarted: number;
		if (this.debugEnabled) frameStarted = performance.now();
		switch (this.state) {
			case WebSnakeState.Stopped:
				return;
			// @ts-expect-error This errors because there's a fallthrough case, but it's intentional, so we expect it.
			case WebSnakeState.Running:
				// Input and game logic
				const ticksToRun = (performance.now() - this.lastTickStarted) / this.minimumTickLength;
				for (let i = 1; i < ticksToRun; i++) {
					this.previousTickState = this.game.state;
					this.previousTickSnakeEnd = this.game.snake[this.game.snake.length - 1];

					this.lastTickStarted = performance.now();
					this.game.tick(this.inputBuffer.shift());
					
					// Text
					this.scoreElement.innerText = this.game.snake.length.toString();
					this.clockElement.innerText = new Date().toLocaleTimeString();
				}

				// Rendering
				// We can't pass the same sinceLastTick here as for ticksToRun because it needs to be *after* we ticked
				this.render(delta, performance.now() - this.lastTickStarted);
			case WebSnakeState.Paused:
				// Next frame
				if (this.debugEnabled) this.debug.push('Frame time: ' + (performance.now() - frameStarted!).toFixed(2))
				requestAnimationFrame(lastFrameEnded => { this.mainLoop(lastFrameEnded) });
				break;
		}
	}

	render(delta: number, sinceLastTick: number) {
		// Rendering (main view)
		this.mainViewContext.clearRect(0, 0, this.mainView.width, this.mainView.height);
		
		// Background
		this.mainViewContext.fillStyle = `#505050`;
		this.mainViewContext.fillRect(this.mainViewOffset.x, this.mainViewOffset.y, this.mainViewTileSize * this.game.boardSize.x, this.mainViewTileSize * this.game.boardSize.y);

		// Elements
		// Apples
		this.game.apples.forEach(apple => {
			this.skins.apple.drawApple(this.mainViewContext, this.mainViewTileSize,
				{
					x: this.mainViewOffset.x + apple.x * this.mainViewTileSize,
					y: this.mainViewOffset.y + apple.y * this.mainViewTileSize
				}
			);
		});

		// Snake body
		this.game.snake.slice(1).forEach((snakePiece, index) => {
			index += 1;

			let prev: Vector2;
			if (index > 0) prev = this.game.snake[index - 1];
			else prev = snakePiece;
			let prevDirection: Vector2 = {
				x: prev.x - snakePiece.x,
				y: prev.y - snakePiece.y
			};

			let next: Vector2;
			if (index < (this.game.snake.length - 1)) next = this.game.snake[index + 1];
			else if (this.smoothingEnabled && this.previousTickSnakeEnd != null) next = this.previousTickSnakeEnd;
			else next = snakePiece;
			let nextDirection: Vector2 = {
				x: next.x - snakePiece.x,
				y: next.y - snakePiece.y
			}

			let direction: Vector2 = {
				x: Math.abs(prevDirection.x) > Math.abs(nextDirection.x) ? prevDirection.x : nextDirection.x,
				y: Math.abs(prevDirection.y) > Math.abs(nextDirection.y) ? prevDirection.y : nextDirection.y
			};

			//console.log(index + ':', prev, snakePiece, next, 'meow!', direction);

			this.skins.snake.drawPiece(this.mainViewContext, this.mainViewTileSize,
				{
					x: this.mainViewOffset.x + snakePiece.x * this.mainViewTileSize,
					y: this.mainViewOffset.y + snakePiece.y * this.mainViewTileSize
				},
				direction,
				index == (this.game.snake.length - 1) && !this.smoothingEnabled ? SnakePiece.End : SnakePiece.Body
			);
		});
		
		// Move snake end and head smoothly
		let offset = this.smoothingEnabled ? (this.previousTickState == SnakeState.DeadByBody || this.game.state == SnakeState.DeadByOutOfBounds ? 0 : Math.min(Math.max(0, sinceLastTick / this.minimumTickLength), 1)) : 1;
		const snakeHead = this.game.snake[0];

		// Snake end
		if (this.smoothingEnabled && this.game.snake.length > 1 && this.previousTickSnakeEnd != undefined) {
			let endVelocity: Vector2 = {
				x: this.previousTickSnakeEnd.x - this.game.snake[this.game.snake.length - 1].x,
				y: this.previousTickSnakeEnd.y - this.game.snake[this.game.snake.length - 1].y,
			};

			const endOffset: Vector2 = {
				x: endVelocity.x * (offset * -1),
				y: endVelocity.y * (offset * -1)
			};

			// Specifically do this AFTER endOffset is set, because we only want this to affect the sprite we use, and not the actual velocity used for smoothing!
			if (endVelocity.x == 0 && endVelocity.y == 0) {
				endVelocity = {
					x: this.game.snake[this.game.snake.length - 1].x - this.game.snake[this.game.snake.length - 2].x,
					y: this.game.snake[this.game.snake.length - 1].y - this.game.snake[this.game.snake.length - 2].y,
				}
			}

			// Make space for tail
			let endX = this.mainViewOffset.x + (this.previousTickSnakeEnd.x + endOffset.x) * this.mainViewTileSize;
			let endY = this.mainViewOffset.y + (this.previousTickSnakeEnd.y + endOffset.y) * this.mainViewTileSize;
			this.mainViewContext.clearRect(
				endOffset.x > 0 ? Math.floor(endX) : Math.ceil(endX),
				endOffset.y > 0 ? Math.floor(endY) : Math.ceil(endY),
				this.mainViewTileSize,
				this.mainViewTileSize
			);

			// Draw tail
			this.skins.snake.drawPiece(this.mainViewContext, this.mainViewTileSize,
				{
					x: this.mainViewOffset.x + (this.previousTickSnakeEnd.x + endOffset.x) * this.mainViewTileSize,
					y: this.mainViewOffset.y + (this.previousTickSnakeEnd.y + endOffset.y) * this.mainViewTileSize
				},
				{ x: endVelocity.x * -1, y: endVelocity.y * -1 },
				SnakePiece.End
			);
		}

		// Snake head
		const headOffset: Vector2 = {
			x: this.game.snakeVelocity.x * offset - this.game.snakeVelocity.x,
			y: this.game.snakeVelocity.y * offset - this.game.snakeVelocity.y
		}

		if (this.smoothingEnabled) {
			// Make space for head
			let headX = this.mainViewOffset.x + (snakeHead.x + headOffset.x) * this.mainViewTileSize
			let headY = this.mainViewOffset.y + (snakeHead.y + headOffset.y) * this.mainViewTileSize
			this.mainViewContext.clearRect(
				headOffset.x > 0 ? Math.floor(headX) : Math.ceil(headX),
				headOffset.y > 0 ? Math.floor(headY) : Math.ceil(headY),
				this.mainViewTileSize,
				this.mainViewTileSize
			);
		}

		this.skins.snake.drawPiece(this.mainViewContext, this.mainViewTileSize,
			{
				x: this.mainViewOffset.x + (snakeHead.x + headOffset.x) * this.mainViewTileSize,
				y: this.mainViewOffset.y + (snakeHead.y + headOffset.y) * this.mainViewTileSize
			},
			{ x: this.game.snakeVelocity.x * -1, y: this.game.snakeVelocity.y * -1 },
			SnakePiece.Head
		);

		// Performance stats
		this.mainViewContext.fillStyle = 'white';
		if (this.debugEnabled) {
			this.debug.push(
				'Delta: ' + delta.toFixed(2),
				'Since tick: ' + sinceLastTick.toFixed(2),
				'Offset: ' + offset.toFixed(2),
				'Now: ' + performance.now().toFixed(2)
			);
			['Debug (press = to hide/show)', ...this.debug].forEach((text, index) => {
				this.mainViewContext.fillText(text, this.mainViewOffset.x, this.mainViewOffset.y + (this.mainViewFontSize * (index + 1)));
			});
			this.debug = [];
		}
	}
}