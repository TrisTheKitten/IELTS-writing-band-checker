import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import checkWritingHandler from "./api/check-writing.js";
import generateTopicHandler from "./api/generate-topic.js";
import lookupWordHandler from "./api/lookup-word.js";

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

function getRequestPath(requestUrl) {
  return requestUrl?.split("?")[0] ?? "";
}

function createApiResponse(response) {
  return {
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
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });

    request.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
  });
}

const API_ROUTES = [
  {
    path: "/api/check-writing",
    handler: checkWritingHandler,
    readBody: true,
    fallbackError: "Score check failed."
  },
  {
    path: "/api/lookup-word",
    handler: lookupWordHandler,
    readBody: false,
    fallbackError: "Dictionary lookup failed."
  },
  {
    path: "/api/generate-topic",
    handler: generateTopicHandler,
    readBody: true,
    fallbackError: "Question generation failed."
  }
];

function apiDevPlugin() {
  return {
    name: "api-dev-plugin",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const route = API_ROUTES.find((entry) => getRequestPath(request.url) === entry.path);

        if (!route) {
          next();
          return;
        }

        try {
          const body = route.readBody ? await readJsonBody(request) : {};
          const apiRequest = {
            method: request.method,
            headers: normalizeIncomingHeaders(request.headers),
            url: request.url,
            body
          };

          await route.handler(apiRequest, createApiResponse(response));
        } catch (error) {
          response.statusCode = error.message === "Request body must be valid JSON." ? 400 : 500;
          response.setHeader("Content-Type", "application/json");
          response.end(
            JSON.stringify({
              error:
                error.message === "Request body must be valid JSON."
                  ? error.message
                  : error.message || route.fallbackError
            })
          );
        }
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
