import type { Vector2 } from '@april83c/snake';

// Base Skin type
export interface Skin {
	name: string;
	description: string;
	creator: string;
}

// Snake skin
export enum SnakePiece {
	Head = 0,
	Body = 1,
	End = 2
}

export interface SnakeSkin extends Skin {
	drawPiece: (context: CanvasRenderingContext2D, tileSize: number, position: Vector2, direction: Vector2, piece: SnakePiece) => void;
}

// Apple skin
export interface AppleSkin extends Skin {
	drawApple: (context: CanvasRenderingContext2D, tileSize: number, position: Vector2) => void;
}

// Field skin
export interface FieldSkin extends Skin {
	// TODO
}