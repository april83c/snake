import { SnakeState, type Vector2 } from '@april83c/snake';
import WebSnake, { WebSnakeState } from './WebSnake';

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
	const startButton = document.querySelector('#page-setup #start');
	if (
		!(boardSizeXInput instanceof HTMLInputElement)
		|| !(boardSizeYInput instanceof HTMLInputElement)
		|| !(applesInput instanceof HTMLInputElement)
		|| !(tickLengthInput instanceof HTMLInputElement)
		|| !(startButton instanceof HTMLButtonElement)
	) throw new Error('Error getting elements for setup');
	startButton.addEventListener('click', () => {
		router.go(Page.Game);
		startSnake({ x: boardSizeXInput.valueAsNumber, y: boardSizeYInput.valueAsNumber }, applesInput.valueAsNumber, tickLengthInput.valueAsNumber);
	});

	// Game over page
	const playAgainButton = document.querySelector('#page-gameover #play-again');
	if (!(playAgainButton instanceof HTMLButtonElement)) throw new Error('Error getting elements for game over');
	playAgainButton.addEventListener('click', () => {
		router.go(Page.Setup);
	});

	router.go(Page.Setup);
}

function startSnake(boardSize: Vector2, apples: number, tickLength: number) {
	const mainView = document.querySelector('#page-game #mainView');
	const score = document.querySelector('#page-game #score');
	const gameOverScore = document.querySelector('#page-gameover #score');
	if (!(
		mainView instanceof HTMLCanvasElement
		&& score instanceof HTMLElement
		&& gameOverScore instanceof HTMLSpanElement
	)) throw new Error('Error getting elements for WebSnake');
	
	if (webSnake != undefined) {
		webSnake.state = WebSnakeState.Stopped;
	}
	webSnake = new WebSnake(document, mainView, score, boardSize, apples, tickLength, (newState) => {
		if (newState != SnakeState.Running) {
			gameOverScore.innerText = webSnake.game.snake.length.toString();
			router.go(Page.GameOver);
		}
	});
}

window.onload = main;