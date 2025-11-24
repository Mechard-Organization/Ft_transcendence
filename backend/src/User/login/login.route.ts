// backend/src/User/login/login.routes.ts
import { FastifyInstance } from "fastify";
import { findUserByUsername, verifyPassword, generateAccessToken } from "./login.service";

export async function loginRoutes(fastify: FastifyInstance) {
  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return reply.status(400).send({ message: "Username and password are required" });
    }

    const user = findUserByUsername(username);
    if (!user) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    const token = generateAccessToken(user);

    // Pour l’instant on renvoie juste le token en JSON
    return reply.send({ access_token: token });
  });
}
