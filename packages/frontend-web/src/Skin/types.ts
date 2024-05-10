import type { Vector2 } from '@april83c/snake';

// Preload image
export function preload(source: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = document.createElement('img');
		image.setAttribute('src', source);

		image.addEventListener('load', () => {
			resolve(image);
		});

		image.addEventListener('error', () => {
			reject();
		});
	});
}

// Base Skin type
export abstract class Skin {
	abstract name: string;
	abstract description: string;
	abstract creator: string;

	readyCallback: (() => any) | undefined;

	constructor(readyCallback?: () => any) {
		this.readyCallback = readyCallback;
	}
}

// Snake skin
export enum SnakePiece {
	Head = 0,
	Body = 1,
	End = 2
}

export abstract class SnakeSkin extends Skin {
	abstract drawPiece(context: CanvasRenderingContext2D, tileSize: number, position: Vector2, direction: Vector2, piece: SnakePiece): void;
}

// Apple skin
export abstract class AppleSkin extends Skin {
	abstract drawApple(context: CanvasRenderingContext2D, tileSize: number, position: Vector2): void;
}

// Field skin
export abstract class FieldSkin extends Skin {
	// TODO
}