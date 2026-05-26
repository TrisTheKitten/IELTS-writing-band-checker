import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import checkWritingHandler from "./api/check-writing.js";

function normalizeIncomingHeaders(headers) {
  const normalized = {};

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue;
    }

    normalized[String(name).toLowerCase()] = Array.isArray(value) ? value.join(", ") : String(value);
  }

  return normalized;
}

function apiDevPlugin() {
  return {
    name: "api-dev-plugin",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url !== "/api/check-writing") {
          next();
          return;
        }

        const chunks = [];

        request.on("data", (chunk) => {
          chunks.push(chunk);
        });

        request.on("end", async () => {
          let body = {};

          if (chunks.length) {
            try {
              body = JSON.parse(Buffer.concat(chunks).toString());
            } catch {
              response.statusCode = 400;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify({ error: "Request body must be valid JSON." }));
              return;
            }
          }

          const apiRequest = {
            method: request.method,
            headers: normalizeIncomingHeaders(request.headers),
            body
          };

          const apiResponse = {
            statusCode: 200,
            status(statusCode) {
              this.statusCode = statusCode;
              return this;
            },
            json(payload) {
              response.statusCode = this.statusCode;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify(payload));
            }
          };

          try {
            await checkWritingHandler(apiRequest, apiResponse);
          } catch (error) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: error.message || "Score check failed." }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    base: "./",
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./shared")
      }
    },
    test: {
      environment: "node"
    }
  };
});
