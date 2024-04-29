import serveStatic from "serve-static-bun";

const app = Bun.serve({ fetch: serveStatic('public') });
console.log(app.url.toString());