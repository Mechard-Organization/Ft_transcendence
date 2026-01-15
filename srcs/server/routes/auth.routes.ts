import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";
import { verifyPassword, generateAccessToken } from "@services/login.service";
import { handleAuthMe } from "../auth";

interface LoginBody {
  username: string;
  password: string;
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

  fastify.get("/me", handleAuthMe);

  fastify.post("/logout", async (_, reply) => {
    reply.clearCookie("access_token", { path: "/" });
    return { ok: true };
  });
}
