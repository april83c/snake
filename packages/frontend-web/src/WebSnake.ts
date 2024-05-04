import Snake, { SnakeState, type SnakeStateCallback, type Vector2 } from '@april83c/snake';

export enum WebSnakeState {
	Stopped = 0,
	Paused = 1,
	Running = 2
}

export default class WebSnake {
	state: WebSnakeState;
	debugEnabled: boolean;
	debug: string[];

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

	scoreElement: HTMLElement;

	constructor(doc: Document, mainView: HTMLCanvasElement, score: HTMLElement, boardSize: Vector2, apples: number, tickLength: number, stateCallback: SnakeStateCallback) {
		this.state = WebSnakeState.Running;
		this.debugEnabled = false;
		this.debug = [];

		this.game = new Snake(boardSize, apples, stateCallback);
		this.previousTickSnakeEnd = this.game.snake[this.game.snake.length - 1];
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
				for (let i = 1; i < ticksToRun; i++) if (this.previousTickState == SnakeState.Running) {
					this.previousTickState = this.game.state;
					this.previousTickSnakeEnd = this.game.snake[this.game.snake.length - 1];

					this.lastTickStarted = performance.now();
					this.game.tick(this.inputBuffer.shift());
					
					// Text
					this.scoreElement.innerText = this.game.snake.length.toString();
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
		this.mainViewContext.fillStyle = 'red';
		this.game.apples.forEach(apple => {
			this.mainViewContext.fillRect(this.mainViewOffset.x + apple.x * this.mainViewTileSize, this.mainViewOffset.y + apple.y * this.mainViewTileSize, this.mainViewTileSize, this.mainViewTileSize);
		});

		// Snake body
		this.mainViewContext.fillStyle = 'darkGreen';
		this.game.snake.slice(1).forEach((snakePiece, index) => {
			this.mainViewContext.fillRect(this.mainViewOffset.x + snakePiece.x * this.mainViewTileSize, this.mainViewOffset.y + snakePiece.y * this.mainViewTileSize, this.mainViewTileSize, this.mainViewTileSize);
		});
		
		// Move snake end and head smoothly
		let offset = this.previousTickState == SnakeState.DeadByBody || this.game.state == SnakeState.DeadByOutOfBounds ? 0 : Math.min(Math.max(0, sinceLastTick / this.minimumTickLength), 1);
		const snakeHead = this.game.snake[0];

		// Snake end
		if (this.game.snake.length > 1 && this.previousTickSnakeEnd != undefined) {
			const endVelocity: Vector2 = {
				x: this.previousTickSnakeEnd.x - this.game.snake[this.game.snake.length - 1].x,
				y: this.previousTickSnakeEnd.y - this.game.snake[this.game.snake.length - 1].y,
			}

			const endOffset: Vector2 = {
				x: endVelocity.x * (offset * -1),
				y: endVelocity.y * (offset * -1)
			};

			// Fill style already set from snake body
			// this.mainViewContext.fillStyle = 'darkGreen';
			// this.mainViewContext.fillStyle = 'purple';
			this.mainViewContext.fillRect(this.mainViewOffset.x + (this.previousTickSnakeEnd.x + endOffset.x) * this.mainViewTileSize, this.mainViewOffset.y + (this.previousTickSnakeEnd.y + endOffset.y) * this.mainViewTileSize, this.mainViewTileSize, this.mainViewTileSize);
		}

		// Snake head
		this.mainViewContext.fillStyle = 'green';

		const headOffset: Vector2 = {
			x: this.game.snakeVelocity.x * offset - this.game.snakeVelocity.x,
			y: this.game.snakeVelocity.y * offset - this.game.snakeVelocity.y
		}
		
		this.mainViewContext.fillRect(this.mainViewOffset.x + (snakeHead.x + headOffset.x) * this.mainViewTileSize, this.mainViewOffset.y + (snakeHead.y + headOffset.y) * this.mainViewTileSize, this.mainViewTileSize, this.mainViewTileSize);

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