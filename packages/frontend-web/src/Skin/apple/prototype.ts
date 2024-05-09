import type { Vector2 } from '@april83c/snake';
import type { AppleSkin } from '../types';

export class AppleSkinPrototype implements AppleSkin {
	name = 'Prototype';
	description = 'Just going for a byte...';
	creator = 'April';

	constructor() {
		// Load assets here?
	}

	drawApple(context: CanvasRenderingContext2D, tileSize: number, position: Vector2) {
		context.fillStyle = 'red';
		context.fillRect(position.x, position.y, tileSize, tileSize);
	}
}