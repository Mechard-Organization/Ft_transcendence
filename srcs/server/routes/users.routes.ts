import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import * as db from "@config/database/db";
import { verifyPassword } from "@services/login.service";
import { handleLogout } from "@services/logout.service";

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
    return id > 0 ? db.getUserById(id) : { username: "Invité.e"};
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

  fastify.post("/updateUserUsername", async (request) => {
    const { id , username } = request.body as any;
    const user = db.getUserById(id);

    if (username == db.getUserById(id).username)
    {
      throw fastify.httpErrors.badRequest("already yours username");
    }
    if (db.getUserByUsername(username))
    {
      throw fastify.httpErrors.badRequest("already taken username");
    }
    db.updateUserUsername(username, id);
    return { ok: true };
  });

  fastify.post("/updateUserMail", async (request) => {
    const { id , mail } = request.body as any;
    const user = db.getUserById(id);

    if (mail == db.getUserById(id).mail)
    {
      throw fastify.httpErrors.badRequest("already yours mail");
    }
    if (db.getUserByMail(mail))
    {
      throw fastify.httpErrors.badRequest("already taken mail");
    }
    db.updateUserMail(mail, id);
    return { ok: true };
  });

  fastify.post("/updateUserAdmin", async (request) => {
    const { id , status } = request.body as any;
    const user = db.getUserById(id);

    db.updateUserAdmin(status, id);
    return { ok: true };
  });

  fastify.post("/delUser", async (request, reply) => {
    const { id } = request.body as any;
    const user = db.getUserById(id);

    db.deleteUserFriend(id);
    db.MessageAnonym(id);
    db.deleteUser(id);
    reply.clearCookie("access_token", { path: "/" });
    return { ok: true };
  });
}
