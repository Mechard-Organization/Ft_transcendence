import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import { parseCookies, sendJson } from "../server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function handleAuthMe(req: IncomingMessage, res: ServerResponse) {
  // 1) On ne traite que GET /api/auth/me
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end();
  }

  // 2) Récupérer le cookie
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["access_token"];

  if (!token) {
    return sendJson(res, 401, { error: "Not authenticated (no token)" });
  }

  try {
    // 3) Vérifier le JWT
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: number | string;
      username?: string;
      [key: string]: unknown;
    };

    // 4) Retourner les infos utiles de l’utilisateur
    return sendJson(res, 200, {
      id: payload.sub,
      username: payload.username,
      // tu peux ajouter d’autres claims ici si tu les mets dans le token
    });
  } catch (err) {
    console.error("JWT verify error:", err);
    return sendJson(res, 401, { error: "Invalid or expired token" });
  }
}
