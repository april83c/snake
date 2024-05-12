import Snake, { SnakeState, type Vector2 } from '@april83c/snake';
import WebSnake, { WebSnakeState, type Locker } from './WebSnake';
import { AppleSkinCheezburger, AppleSkinPrototype, FieldSkin, SnakeSkin, SnakeSkinPrototype, type AppleSkin } from './Skin';
import { SnakeSkinNeocat } from './Skin/snake/neocat';

function notNull<desired>(v: desired | null) {
	if (v == null) throw new Error('Null');
	else return v as desired;
}

// Main code

let webSnake: WebSnake;
let router: Router;

enum Page {
	Loading = 0,
	Game = 1,
	Setup = 2,
	GameOver = 3
}

class Router {
	activePage: Page; // TODO: How to do private setters in TS? Or maybe just replace go() with a setter
	pages: {
		[Page.Loading]: HTMLElement
		[Page.Game]: HTMLElement;
		[Page.Setup]: HTMLElement;
		[Page.GameOver]: HTMLElement;
	};

	constructor() {
		this.pages = {
			[Page.Loading]: notNull(document.getElementById('page-loading')),
			[Page.Game]: notNull(document.getElementById('page-game')),
			[Page.Setup]: notNull(document.getElementById('page-setup')),
			[Page.GameOver]: notNull(document.getElementById('page-gameover'))
		};

		this.activePage = Page.Loading;
	}

	go(page: Page) {
		this.pages[this.activePage].style.display = 'none';
		this.pages[page].style.display = '';
		this.activePage = page;
	}
}

function main() {
	router = new Router();
	
	// Get elements
	// Setup page
	const boardSizeXInput = document.querySelector('#page-setup #board-size-x');
	const boardSizeYInput = document.querySelector('#page-setup #board-size-y');
	const applesInput = document.querySelector('#page-setup #apples');
	const tickLengthInput = document.querySelector('#page-setup #tick-length');
	const smoothingEnabledInput = document.querySelector('#page-setup #smoothing-enabled');
	const startButton = document.querySelector('#page-setup #start');
	const skinSelect = document.querySelector('#page-setup #skin');
	if (!(
		boardSizeXInput instanceof HTMLInputElement
		&& boardSizeYInput instanceof HTMLInputElement
		&& applesInput instanceof HTMLInputElement
		&& tickLengthInput instanceof HTMLInputElement
		&& smoothingEnabledInput instanceof HTMLInputElement
		&& startButton instanceof HTMLButtonElement
		&& skinSelect instanceof HTMLSelectElement
	)) throw new Error('Error getting elements for setup');
	startButton.addEventListener('click', () => {
		router.go(Page.Game);
		startSnake({ x: boardSizeXInput.valueAsNumber, y: boardSizeYInput.valueAsNumber }, applesInput.valueAsNumber, tickLengthInput.valueAsNumber, smoothingEnabledInput.checked, skinSelect.value);
	});

	// Game over page
	const playAgainButton = document.querySelector('#page-gameover #play-again');
	if (!(playAgainButton instanceof HTMLButtonElement)) throw new Error('Error getting elements for game over');
	playAgainButton.addEventListener('click', () => {
		webSnake.state = WebSnakeState.Stopped;
		router.go(Page.Setup);
	});

	router.go(Page.Setup);
}

function startSnake(boardSize: Vector2, apples: number, tickLength: number, smoothingEnabled: boolean, skin: string) {
	const mainView = document.querySelector('#page-game #mainView');
	const score = document.querySelector('#page-game #score');
	const clock = document.querySelector('#page-game #clock');
	const gameOverScore = document.querySelector('#page-gameover #score');
	const gameOverMainView = document.querySelector('#page-gameover #mainView');

	if (!(
		mainView instanceof HTMLCanvasElement
		&& score instanceof HTMLSpanElement
		&& clock instanceof HTMLSpanElement
		&& gameOverScore instanceof HTMLSpanElement
		&& gameOverMainView instanceof HTMLCanvasElement
	)) throw new Error('Error getting elements for WebSnake');

	let locker: Locker;
	let _appleSkin: AppleSkin;
	let _snakeSkin: SnakeSkin;
	let _fieldSkin: FieldSkin;
	Promise.all([
		new Promise<void>((resolve) => {
			_appleSkin = skin == 'kitty' ? new AppleSkinCheezburger(() => { resolve() }) : new AppleSkinPrototype(() => { resolve() });
		}),
		new Promise<void>((resolve) => {
			_snakeSkin = skin == 'kitty' ? new SnakeSkinNeocat(() => { resolve() }) : new SnakeSkinPrototype(() => { resolve() });
		})
	]).then(() => {
		locker = {
			apple: _appleSkin,
			snake: _snakeSkin
		}

		if (webSnake != undefined) {
			webSnake.state = WebSnakeState.Stopped;
		}
		webSnake = new WebSnake(document, mainView, score, clock, tickLength, smoothingEnabled, locker, new Snake(boardSize, apples, (newState, snake) => {
			if (newState != SnakeState.Running) {
				webSnake.state = WebSnakeState.Stopped;
				gameOverScore.innerText = snake.snake.length.toString();
				gameOverMainView.style.aspectRatio = `${boardSize.x} / ${boardSize.y}`;
				webSnake = new WebSnake(document, gameOverMainView, score, clock, tickLength, false, locker, snake);
				router.go(Page.GameOver);
			}
		}));
	})
}

window.onload = main;