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
