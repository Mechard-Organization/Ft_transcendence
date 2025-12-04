// logout.ts
import { IncomingMessage, ServerResponse } from "http";

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  const json = JSON.stringify(body);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(json));
  res.end(json);
}

export function handleLogout(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    return res.end();
  }

  // ⚠️ On efface le cookie HttpOnly
  res.setHeader("Set-Cookie", [
    `access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  ]);

  return sendJson(res, 200, { ok: true, message: "Logged out" });
}
