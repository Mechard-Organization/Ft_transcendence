import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";
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
    console.log(id);
    return id > 0 ? db.getUserById(id) : { username: "Invité.e"};
  });

  fastify.post("/getuserbyname", async (request) => {
    const { username } = request.body as any;
    const user = db.getUserByUsername(username);
    if (!user) throw fastify.httpErrors.notFound("User not found");
    return user;
  });

  fastify.put("/updateUserPassword", async (request) => {
    const { id, password } = request.body as any;
    const user = db.getUserById(id);

    const same = await verifyPassword(password, user.password_hash);
    if (same) throw fastify.httpErrors.badRequest("Same password");

    const hash = await bcrypt.hash(password, 10);
    db.updateUserPassword(hash, id);
    return { ok: true };
  });

  fastify.put("/updateUserUsername", async (request) => {
    const { id , username } = request.body as any;

    const user = db.getUserById(id);
    if (username == user.username)
    {
      throw fastify.httpErrors.badRequest("already yours username");
    }
    if (db.getUserByUsername(username))
    {
      throw fastify.httpErrors.badRequest("already taken username");
    }
    db.updateUserUsername(username, id);
    db.updateMatch(user.username, username)
    return { ok: true };
  });

  fastify.put("/updateUserMail", async (request) => {
    const { id , mail } = request.body as any;

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

  fastify.put("/updateUserAdmin", async (request) => {
    const { id , status } = request.body as any;

    db.updateUserAdmin(status, id);
    return { ok: true };
  });

  fastify.delete("/delUser", async (request, reply) => {
    const { id } = request.body as any;
    const user = db.getUserById(id);

    db.deleteUserFriend(id);
    db.deleteUserBlocks(id);
    db.deleteUserFromGroups(id);
    db.MessageAnonym(id);
    db.deleteUser(id);
    reply.clearCookie("access_token", { path: "/" });
    return { ok: true };
  });

  //GESTION DE L'AVATAR

  fastify.post("/users/me/avatar", async (req, reply) => {
    let id: string | undefined;
    let buffer: Buffer | undefined;
    let mimeType = "";

    for await (const part of req.parts()) {
      if (part.type === "file") {
        if (!part.mimetype.startsWith("image/")) {
          return fastify.httpErrors.badRequest("Format invalide");
        }

        mimeType = part.mimetype;
        buffer = await part.toBuffer();
      } else {
        if (part.fieldname === "id") {
          id = part.value as string;
        }
      }
    }

    if (!buffer) {
      return fastify.httpErrors.badRequest("Fichier manquant");
    }
    if (!id) {
      return fastify.httpErrors.badRequest("ID manquant");
    }

    const filename = `${crypto.randomUUID()}.jpg`;
    const filepath = path.join("uploads/profil", filename);

    // 🔹 Resize + optimisation
    await sharp(buffer)
      .resize(256, 256)
      .jpeg({ quality: 80 })
      .toFile(filepath);

    // 🔹 Supprimer l'ancien avatar si existant
    const user = db.getUserById(id);

    if (user?.avatarUrl) {
      const oldPath = path.join(process.cwd(), user.avatarUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // 🔹 Sauvegarde DB
    db.updateUserPp(`/uploads/profil/${filename}`, id);
    fastify.websocketServer.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "new_avatar", data: {avatarUrl: `/uploads/profil/${filename}`} }));
      }
    });

    return { avatarUrl: `/uploads/profil/${filename}` };
  });

  fastify.post("/users/me/delavatar", async (req, reply) => {
    const { id } = req.body as any;
    const user = db.getUserById(id);

    if (user?.avatarUrl) {
      const filepath = path.join(process.cwd(), user.avatarUrl);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      db.updateUserPp(null, id);
    }
    return { success: true };
  });

  fastify.post("/users/me/getavatar", async (req) => {
  const { id } = req.body as any;
  const user = db.getUserById(id);
  if (!user) throw fastify.httpErrors.notFound("User not found");
  return { avatarUrl: user.avatarUrl || null };
  });

  //RANKING
  fastify.get("/ranking", async () => db.ranking());
}
