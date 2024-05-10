import type { Vector2 } from '@april83c/snake';
import { SnakeSkin, SnakePiece, preload } from '../types';

export class SnakeSkinNeocat extends SnakeSkin {
	name = 'Neocat';
	description = 'Warning: explosion danger';
	creator = 'Volpeon';

	assets: {
		[SnakePiece.Head]: {
			['-1,0']: HTMLImageElement,
			['0,-1']: HTMLImageElement,
			['0,1']: HTMLImageElement,
			['1,0']: HTMLImageElement
		},
		[SnakePiece.Body]: {
			['-1,-1']: HTMLImageElement,
			['-1,1']: HTMLImageElement,
			['0,1']: HTMLImageElement,
			['0,-1']: HTMLImageElement,
			['1,-1']: HTMLImageElement,
			['1,0']: HTMLImageElement,
			['-1,0']: HTMLImageElement,
			['1,1']: HTMLImageElement
		},
		[SnakePiece.End]: {
			['-1,0']: HTMLImageElement,
			['0,-1']: HTMLImageElement,
			['0,1']: HTMLImageElement,
			['1,0']: HTMLImageElement
		}
	} | undefined

	constructor(readyCallback?: () => any) {
		super(readyCallback);

		// Load images
		Promise.all([
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Head}/-1,0.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Head}/0,-1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Head}/0,1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Head}/1,0.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Body}/-1,-1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Body}/-1,1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Body}/0,1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Body}/1,-1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Body}/1,0.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.Body}/1,1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.End}/-1,0.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.End}/0,-1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.End}/0,1.png`),
			preload(`assets/images/skin/snake/${this.name}/${SnakePiece.End}/1,0.png`)
		]).then((unknownImages: unknown[]) => {
			let images = unknownImages as HTMLImageElement[];
			this.assets = {
				[SnakePiece.Head]: {
					['-1,0']: images[0],
					['0,-1']: images[1],
					['0,1']: images[2],
					['1,0']: images[3]
				},
				[SnakePiece.Body]: {
					['-1,-1']: images[4],
					['-1,1']: images[5],
					['0,1']: images[6],
					['0,-1']: images[6],
					['1,-1']: images[7],
					['1,0']: images[8],
					['-1,0']: images[8],
					['1,1']: images[9]
				},
				[SnakePiece.End]: {
					['-1,0']: images[10],
					['0,-1']: images[11],
					['0,1']: images[12],
					['1,0']: images[13]
				}
			}
			if (this.readyCallback != undefined) this.readyCallback();
		});
	}

	drawPiece(context: CanvasRenderingContext2D, tileSize: number, position: Vector2, direction: Vector2, piece: SnakePiece) {
		if (this.assets == undefined) throw new Error(`Skin ${this.name} used before ready`);
		
		try { 
			// @ts-expect-error >:3
			let image = this.assets[piece][`${direction.x.toString()},${direction.y.toString()}`];
			
			context.drawImage(image, position.x, position.y, tileSize, tileSize);
		} catch {
			context.fillStyle = 'purple';
			context.fillRect(position.x, position.y, tileSize, tileSize);
		}
	}
}