import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export async function handleAuthMe(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Fastify gère déjà la méthode HTTP
  // donc plus besoin de vérifier GET

  // 🍪 Cookies via @fastify/cookie
  const token = request.cookies?.access_token;

  // ✅ Cas 1 : pas de token
  if (!token) {
    return reply.code(200).send({
      authenticated: false,
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: number | string;
      id?: string;
    };

    // ✅ Cas 2 : token valide
    return reply.code(200).send({
      authenticated: true,
      id: payload.sub,
    });
  } catch (err) {
    console.error("JWT verify error:", err);

    // ✅ Cas 3 : token invalide / expiré
    return reply.code(200).send({
      authenticated: false,
      reason: "invalid_or_expired",
    });
  }
}

export function getAccessUserId(request: FastifyRequest): number | null {
  const token = request.cookies?.access_token;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number | string };
    const userId = Number(payload.sub);
    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
}

// créer un jeton signé (temporaire)
export function signTwofaPending(userId: number) {
  return jwt.sign(
    { sub: userId, type: "2fa_pending" },
    JWT_SECRET,
    { expiresIn: "5m" }
  );
}

// vérifier que le ticket est valide
export function verifyTwofaPending(token: string): number | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.type !== "2fa_pending") return null;
    return Number(payload.sub);
  } catch {
    return null;
  }
}
