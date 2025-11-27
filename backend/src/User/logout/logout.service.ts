// logout.ts
import { IncomingMessage, ServerResponse } from "http";
import { sendJson } from "../httpUtils";

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
