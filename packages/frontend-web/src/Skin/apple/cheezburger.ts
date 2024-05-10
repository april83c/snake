import type { Vector2 } from '@april83c/snake';
import { AppleSkin, Skin, preload } from '../types';

export class AppleSkinCheezburger extends AppleSkin {
	name = 'Cheezburger';
	description = 'Here kitty! You can haz cheezburger!';
	creator = 'ROBLOX';

	assets: {
		apple: HTMLImageElement
	} | undefined

	constructor(readyCallback?: () => any) {
		super(readyCallback);

		// Load images
		Promise.all([
			preload(`assets/images/skin/apple/${this.name}/apple.png`)
		]).then((images: unknown[]) => {
			this.assets = {
				apple: images[0] as HTMLImageElement
			}
			if (this.readyCallback != undefined) this.readyCallback();
		});
	}

	drawApple(context: CanvasRenderingContext2D, tileSize: number, position: Vector2) {
		if (this.assets == undefined) throw new Error(`Skin ${this.name} used before ready`);
		context.drawImage(this.assets.apple, position.x, position.y, tileSize, tileSize);
	}
}