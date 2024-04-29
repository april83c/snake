import Snake, { SnakeState, type Vector2 } from "@april83c/snake";

// Set up stdin
process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');

let rawInput = '';
process.stdin.on('data', data => {
	rawInput = rawInput + data;
});

process.stdin.resume();

// Game
let game = new Snake({ x: 30, y: 15 }, 5);
function mainLoop() {
	if (game.state == SnakeState.Running) {
		// Input
		let input: Vector2;
		switch (rawInput) {
			case '\u0003':
				process.exit();
			case 'w': // up
				input = { x: 0, y: -1 };
				break;
			case 's': // down
				input = { x: 0, y: 1 };
				break;
			case 'a': // left
				input = { x: -1, y: 0 };
				break;
			case 'd': // right
				input = { x: 1, y: 0 };
				break;
			case null:
			default:
				input = { x: 0, y: 0 };
				break;
		}
		rawInput = '';
		game.tick(input);

		// Rendering
		console.clear();
		console.log('--- Snake ---');
		for (let row = 0; row < game.boardSize.y; row++) {
			for (let column = 0; column < game.boardSize.x; column++ ) {
				const snakeIndex = game.snake.findIndex(snakePiece => snakePiece.x == column && snakePiece.y == row);
				if (snakeIndex != -1) {
					if (snakeIndex == 0) console.write('🐍');
					else console.write('🟩');
				} else if (game.apples.find(apple => apple.x == column && apple.y == row)) {
					console.write('🍎');
				} else {
					console.write('⬛');
				}
			}
			console.write('\n');
		}
		
		setTimeout(mainLoop, 100);
	} else {
		console.log('Game over!');
		process.exit();
	}
}

mainLoop();