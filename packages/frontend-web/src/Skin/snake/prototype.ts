import type { Vector2 } from '@april83c/snake';
import { SnakeSkin, SnakePiece } from '../types';

export class SnakeSkinPrototype extends SnakeSkin {
	name = 'Prototype';
	description = 'The original.';
	creator = 'April';

	constructor(readyCallback?: () => any) {
		super(readyCallback);
		if (this.readyCallback != undefined) this.readyCallback();
	}

	drawPiece(context: CanvasRenderingContext2D, tileSize: number, position: Vector2, direction: Vector2, piece: SnakePiece) {
		switch (piece) {
			case SnakePiece.Head:
				context.fillStyle = 'green';
				break;
			default:
				context.fillStyle = 'darkGreen';
				break;
		}
		context.fillRect(position.x, position.y, tileSize, tileSize);
	}
}