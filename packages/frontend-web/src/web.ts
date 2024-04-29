import Snake, { SnakeState, type Vector2 } from '@april83c/snake';

class WebSnake {
	game: Snake;
	inputBuffer: Vector2[];
	minimumTickLength: number;
	lastTickStarted: number;

	mainView: HTMLCanvasElement;
	mainViewContext: CanvasRenderingContext2D;
	mainViewTileSize: number;
	mainViewOffset: Vector2;

	constructor(doc: Document, mainView: HTMLCanvasElement) {
		this.game = new Snake({ x: 30, y: 15 }, 5);
		this.minimumTickLength = 16 * 4;
		this.lastTickStarted = Date.now() - this.minimumTickLength;

		// Set up main view
		this.mainView = mainView;
		const context: CanvasRenderingContext2D | null = this.mainView.getContext('2d');
		if (context === null) {
			throw new Error('Couldn\'t get main view canvas context.');
		} else {
			this.mainViewContext = context;
			context.save();
		}

		// Observe main view size
		this.mainViewTileSize = 1;
		this.mainViewOffset = { x: 0, y: 0 };

		const resizeHandler = () => {
			this.mainView.width = this.mainView.clientWidth;
			this.mainView.height = this.mainView.clientHeight;

			this.mainViewTileSize = Math.floor(Math.min(
				this.mainView.width / this.game.boardSize.x,
				this.mainView.height / this.game.boardSize.y
			));
			this.mainViewOffset.x = Math.floor((this.mainView.width - (this.mainViewTileSize * this.game.boardSize.x)) / 2);
			this.mainViewOffset.y = Math.floor((this.mainView.height - (this.mainViewTileSize * this.game.boardSize.y)) / 2);

			this.render();
		}
		resizeHandler();

		const observer = new ResizeObserver(resizeHandler);
		observer.observe(this.mainView);

		// Listen for input
		this.inputBuffer = [];
		doc.addEventListener('keydown', (event) => {
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
				}
			}

			if (handled) event.preventDefault();
		})

		this.mainLoop();
	}

	mainLoop() {
		const tickStarted = Date.now();

		// Input
		const framesToRun = Math.max(1, (tickStarted - this.lastTickStarted) / this.minimumTickLength);
		for (let i = 1; i < framesToRun; i++) if (this.game.state == SnakeState.Running) this.game.tick(this.inputBuffer.shift());

		// Rendering
		this.render();
	
		this.lastTickStarted = tickStarted;
		setTimeout(
			() => { this.mainLoop() }, 
			Math.max(0, this.minimumTickLength - (Date.now() - tickStarted))
		);
	}

	render() {
		// Rendering (main view)
		this.mainViewContext.restore();
		
		// Background
		this.mainViewContext.fillStyle = `#333333`;
		this.mainViewContext.fillRect(this.mainViewOffset.x, this.mainViewOffset.y, this.mainViewTileSize * this.game.boardSize.x, this.mainViewTileSize * this.game.boardSize.y);

		// Elements
		for (let row = 0; row < this.game.boardSize.y; row++) {
			for (let column = 0; column < this.game.boardSize.x; column++ ) {
				const snakeIndex = this.game.snake.findIndex(snakePiece => snakePiece.x == column && snakePiece.y == row);
				if (snakeIndex != -1) {
					if (snakeIndex == 0) this.mainViewContext.fillStyle = 'green';
					else this.mainViewContext.fillStyle = 'darkGreen';
				} else if (this.game.apples.find(apple => apple.x == column && apple.y == row)) {
					this.mainViewContext.fillStyle = 'red';
				} else {
					continue;
				}

				this.mainViewContext.fillRect(this.mainViewOffset.x + column * this.mainViewTileSize, this.mainViewOffset.y + row * this.mainViewTileSize, this.mainViewTileSize, this.mainViewTileSize);
			}
		}
	}
}

let instance: WebSnake;
window.onload = () => {
	const mainView = document.getElementById('mainView');
	if (mainView instanceof HTMLCanvasElement) instance = new WebSnake(document, mainView);
};