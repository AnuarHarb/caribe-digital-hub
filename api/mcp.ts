import type { VercelRequest, VercelResponse } from "@vercel/node";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  createMareaServer,
  loadEnv,
  resolveAuth,
  runWithAuth,
} from "../mcp/marea.mjs";
import { join } from "node:path";

export const config = { maxDuration: 60 };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, X-Costa-Email, X-Costa-Password",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

function applyCors(res: VercelResponse) {
  for (const [key, value] of Object.entries(CORS)) {
    res.setHeader(key, value);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  loadEnv(join(process.cwd(), ".env"));

  const session = await resolveAuth(req.headers).catch((err: Error) => {
    res.status(401).json({ error: err.message });
    return "invalid" as const;
  });
  if (session === "invalid") return;

  const server = await createMareaServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  await runWithAuth(session, () =>
    transport.handleRequest(req, res, req.body),
  );
}
