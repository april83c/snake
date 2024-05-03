import serveStatic from "serve-static-bun";

const app = Bun.serve({ fetch: serveStatic('public', {
	headers: {
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Cross-Origin-Embedder-Policy': 'require-corp'
	}
})});
console.log(app.url.toString());