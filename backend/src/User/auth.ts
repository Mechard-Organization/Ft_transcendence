import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function parseCookies(cookieHeader?: string) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=");
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join("="));
  }
  return cookies;
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  const json = JSON.stringify(body);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(json));
  res.end(json);
}

export function handleAuthMe(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end();
  }

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["access_token"];

  // ✅ Cas 1 : aucun token → utilisateur NON connecté
  if (!token) {
    return sendJson(res, 200, {
      authenticated: false,
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: number | string;
      id?: string;
    };

    // ✅ Cas 2 : token valide → utilisateur connecté
    return sendJson(res, 200, {
      authenticated: true,
      id: payload.sub,
    });
  } catch (err) {
    console.error("JWT verify error:", err);

    // ✅ Cas 3 : token invalide / expiré → NON connecté
    return sendJson(res, 200, {
      authenticated: false,
      reason: "invalid_or_expired",
    });
  }
}
