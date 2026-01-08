import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import * as db from "@config/database/db";
import { verifyPassword } from "@services/login.service";

export default async function userRoutes(fastify: FastifyInstance) {

  fastify.get("/users", async () => db.getAllUsers());

  fastify.post("/users", async (request) => {
    const { username, password, mail } = request.body as any;

    if (!username || !password || !mail)
      throw fastify.httpErrors.badRequest("Missing fields");

    if (db.getUserByUsername(username))
      throw fastify.httpErrors.conflict("Username exists");

    if (db.getUserByMail(mail))
      throw fastify.httpErrors.conflict("Mail exists");

    const hash = await bcrypt.hash(password, 10);
    return db.createUser(username, hash, mail);
  });

  fastify.post("/getuser", async (request) => {
    const { id } = request.body as any;
    return id > 0 ? db.getUserById(id) : "Invité.e";
  });

  fastify.post("/getuserbyname", async (request) => {
    const { username } = request.body as any;
    const user = db.getUserByUsername(username);
    if (!user) throw fastify.httpErrors.notFound("User not found");
    return user;
  });

  fastify.post("/updateUserPassword", async (request) => {
    const { id, password } = request.body as any;
    const user = db.getUserById(id);

    const same = await verifyPassword(password, user.password_hash);
    if (same) throw fastify.httpErrors.badRequest("Same password");

    const hash = await bcrypt.hash(password, 10);
    db.updateUserPassword(hash, id);
    return { ok: true };
  });
}
