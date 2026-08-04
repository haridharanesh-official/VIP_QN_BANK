import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL(".", import.meta.url));
const publicDirectory = join(directory, "public");
const questions = JSON.parse(await readFile(join(directory, "questions.json"), "utf8"));

const contentTypes = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

function sendJson(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

import { generatePaper } from "./generator.mjs";

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  if (url.pathname === "/api/health") return sendJson(response, 200, { status: "ok", service: "edugen-prototype" });
  if (url.pathname === "/api/questions" && request.method === "GET") return sendJson(response, 200, { items: questions, total: questions.length });
  if (url.pathname === "/api/academic" && request.method === "GET") return sendJson(response, 200, { boards: [{ id: "tn-state", name: "Tamil Nadu State Board" }], standards: [{ id: "10", name: "Class 10" }], subjects: [{ id: "maths", name: "Mathematics" }], chapters: [
    { id: "real-numbers", name: "Real Numbers" }, { id: "polynomials", name: "Polynomials" }, { id: "linear-equations", name: "Pair of Linear Equations" }
  ] });
  if (url.pathname === "/api/papers/generate" && request.method === "POST") {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    try {
      const result = generatePaper(questions, JSON.parse(raw || "{}"));
      return sendJson(response, result.success ? 200 : 422, result);
    } catch (error) {
      return sendJson(response, 400, { success: false, code: "INVALID_REQUEST", message: error instanceof Error ? error.message : "Invalid request" });
    }
  }

  const relativePath = url.pathname === "/" ? "index.html" : url.pathname.replace(/^\//, "");
  const filePath = join(publicDirectory, relativePath);
  if (!filePath.startsWith(publicDirectory)) { response.writeHead(403); return response.end("Forbidden"); }
  try {
    const body = await readFile(filePath);
    response.writeHead(200, { "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

const port = Number(process.env.PORT ?? 4173);
server.listen(port, () => console.log(`VIP Maths prototype running at http://localhost:${port}`));
