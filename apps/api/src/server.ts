import app from "./index";

const server = Bun.serve({
  fetch: app.fetch,
  port: 3000,
  // Increase timeout to 60 seconds
  idleTimeout: 240,
  development: true,
});

console.log(`🚀 Server running at http://localhost:${server.port}`);
