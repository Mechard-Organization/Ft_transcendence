import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";
import { verifyPassword, generateAccessToken } from "@services/login.service";
import { handleAuthMe, signTwofaPending, verifyTwofaPending, getAccessUserId } from "../auth";
import { generateSecret, generateURI, verify } from "otplib";
import * as qrcode from "qrcode";
import "@fastify/cookie";

interface LoginBody {
  username: string;
  password: string;
}

interface Verify2faBody {
  code: string;
}

interface Setup2faBody {
  id: number | string;
}

interface Enable2faBody {
  id: number | string;
  code: string;
}

interface Disable2faBody {
  id: number | string;
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body as LoginBody;

    if (!username || !password) {
      return reply.code(400).send({ error: "Username and password are required" });
    }

    const user = db.getUserByUsername(username);
    if (!user) return reply.code(401).send({ error: "Invalid credentials" });

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return reply.code(401).send({ error: "Invalid credentials" });

    if (user.twofa_enabled === 1) {
      const pending = signTwofaPending(user.id);

      reply.setCookie("twofa_pending", pending, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 300,
      });

    return reply.code(200).send({ twofa_required: true });
    }

    const token = generateAccessToken(user);

    reply.setCookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600,
    });

    return { ok: true };
  });


  fastify.post("/login/2fa/verify", async (request, reply) => {
    const { code } = request.body as Verify2faBody;

    if (!code) return reply.code(400).send({ error: "Code is required" });

    const pending = request.cookies?.twofa_pending;
    if (!pending) return reply.code(401).send({ error: "2FA not started" });

    const userId = verifyTwofaPending(pending);
    if (!userId) return reply.code(401).send({ error: "Invalid or expired 2FA session" });

    const user = db.getUserById(String(userId));
    if (!user) return reply.code(401).send({ error: "Invalid session" });
    
    if (user.twofa_enabled !== 1 || !user.twofa_secret) {
      return reply.code(400).send({ error: "2FA not enabled" });
    }

    const result = await verify({ token: code, secret: user.twofa_secret });
    const ok = typeof result === "boolean" ? result : result?.valid === true;
    if (!ok) return reply.code(401).send({ error: "Invalid 2FA code" });

    const token = generateAccessToken(user);

    reply.setCookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600,
    });

  reply.clearCookie("twofa_pending", { path: "/" });

  return { ok: true };
});

  fastify.post("/2fa/setup", async (request, reply) => {
    const { id } = request.body as Setup2faBody;
    if (!id) return reply.code(400).send({ error: "ID is required" });
    const accessUserId = getAccessUserId(request);
    if (!accessUserId) return reply.code(401).send({ error: "Unauthorized" });
    const bodyUserId = Number(id);
    if (!Number.isFinite(bodyUserId)) return reply.code(400).send({ error: "Invalid ID" });
    if (bodyUserId !== accessUserId) return reply.code(403).send({ error: "Forbidden" });

    const user = db.getUserById(String(accessUserId));
    if (!user) return reply.code(404).send({ error: "User not found" });
    if (user.twofa_enabled === 1) return reply.code(400).send({ error: "2FA already enabled" });

    try {
      const secret = generateSecret();
      const otpauth = generateURI({
        secret,
        label: user.username,
        issuer: "ft_transcendence"
      });

      db.setTwofaTempSecret(accessUserId, secret);

      const qr = await qrcode.toDataURL(otpauth);
      return reply.code(200).send({ otpauth, qr });
    } catch (err: any) {
      console.error("2FA setup error:", err);
      return reply.code(500).send({ error: "2FA setup failed" });
    }
  });

  fastify.post("/2fa/enable", async (request, reply) => {
    const { id, code } = request.body as Enable2faBody;
    if (!id || !code) return reply.code(400).send({ error: "ID and code are required" });
    const accessUserId = getAccessUserId(request);
    if (!accessUserId) return reply.code(401).send({ error: "Unauthorized" });
    const bodyUserId = Number(id);
    if (!Number.isFinite(bodyUserId)) return reply.code(400).send({ error: "Invalid ID" });
    if (bodyUserId !== accessUserId) return reply.code(403).send({ error: "Forbidden" });

    const user = db.getUserById(String(accessUserId));
    if (!user) return reply.code(404).send({ error: "User not found" });
    if (user.twofa_enabled === 1) return reply.code(400).send({ error: "2FA already enabled" });
    if (!user.twofa_temp_secret) return reply.code(400).send({ error: "2FA not initialized" });

    const result = await verify({ token: code, secret: user.twofa_temp_secret });
    const ok = typeof result === "boolean" ? result : result?.valid === true;
    if (!ok) return reply.code(401).send({ error: "Invalid 2FA code" });

    db.enableTwofa(accessUserId);
    return { ok: true };
  });

  fastify.post("/2fa/disable", async (request, reply) => {
    const { id } = request.body as Disable2faBody;
    if (!id) return reply.code(400).send({ error: "ID is required" });
    const accessUserId = getAccessUserId(request);
    if (!accessUserId) return reply.code(401).send({ error: "Unauthorized" });
    const bodyUserId = Number(id);
    if (!Number.isFinite(bodyUserId)) return reply.code(400).send({ error: "Invalid ID" });
    if (bodyUserId !== accessUserId) return reply.code(403).send({ error: "Forbidden" });

    const user = db.getUserById(String(accessUserId));
    if (!user) return reply.code(404).send({ error: "User not found" });

    db.disableTwofa(accessUserId);
    return { ok: true };
  });

  fastify.get("/me", handleAuthMe);

  fastify.post("/logout", async (_, reply) => {
    reply.clearCookie("access_token", { path: "/" });
    reply.clearCookie("twofa_pending", { path: "/" });
    return { ok: true };
  });
}
