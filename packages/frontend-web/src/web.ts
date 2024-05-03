import { SnakeState } from '@april83c/snake';
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
	
	// Buttons
	const startButton = document.querySelector('#page-setup #start');
	if (!(startButton instanceof HTMLButtonElement)) throw new Error('Error getting elements for setup');
	startButton.addEventListener('click', () => {
		router.go(Page.Game);
		startSnake();
	});

	const playAgainButton = document.querySelector('#page-gameover #play-again');
	if (!(playAgainButton instanceof HTMLButtonElement)) throw new Error('Error getting elements for game over');
	playAgainButton.addEventListener('click', () => {
		router.go(Page.Setup);
	});

	router.go(Page.Setup);
}

function startSnake() {
	const mainView = document.querySelector('#page-game #mainView');
	const score = document.querySelector('#page-game #score');
	if (!(
		mainView instanceof HTMLCanvasElement
		&& score instanceof HTMLElement
	)) throw new Error('Error getting elements for WebSnake');
	
	webSnake = new WebSnake(document, mainView, score, (newState) => {
		if (newState != SnakeState.Running) {
			router.go(Page.GameOver);
		}
	});
}

window.onload = main;