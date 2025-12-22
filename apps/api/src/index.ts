import { Hono } from "hono";
import { cors } from "hono/cors";
import rootRoute from "./routes/index";
import awsRoute from "./routes/aws";
import publicRoute from "./routes/public";
import mcpRoute from "./routes/mcp";
// Import the OpenAPI spec as a plain text string. This works both in Bun/Node and in
// Cloudflare Workers because the JSON import is inlined into the bundle.
import openapiSpec from "../openapi.yaml" assert { type: "text" };

const app = new Hono();

// Enable CORS for all origins in development
app.use("*", cors());

// Serve OpenAPI spec with correct content type
app.get("/openapi.yaml", (c) => {
  const filePath = path.join(import.meta.dir, "../openapi.yaml");
  const content = fs.readFileSync(filePath, "utf-8");
  return c.text(content, 200, {
    "Content-Type": "text/yaml; charset=utf-8",
  });
});

// API Documentation UI (Scalar)
app.get("/docs", (c) => {
  return c.html(`
<!DOCTYPE html>
<html>
<head>
  <title>BMKG Weather API - Documentation</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script id="api-reference" data-url="/openapi.yaml"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
  `);
});

// Mount routes
app.route("/", mcpRoute);
app.route("/api", rootRoute);
app.route("/aws", awsRoute);
app.route("/public", publicRoute);

export default app;
