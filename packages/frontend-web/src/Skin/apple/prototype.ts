import type { Vector2 } from '@april83c/snake';
import { AppleSkin, Skin } from '../types';

export class AppleSkinPrototype extends AppleSkin {
	name = 'Prototype';
	description = 'Just going for a byte...';
	creator = 'April';

	constructor(readyCallback?: () => any) {
		super(readyCallback);
		if (this.readyCallback != undefined) this.readyCallback();
	}

	drawApple(context: CanvasRenderingContext2D, tileSize: number, position: Vector2) {
		context.fillStyle = 'red';
		context.fillRect(position.x, position.y, tileSize, tileSize);
	}
}