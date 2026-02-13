import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";

export default async function userRoutes(fastify: FastifyInstance) {

  fastify.post("/creatBlock", async (request) => {
    const { id_user, id_block } = request.body as any;

    if (!id_user || !id_block)
      throw fastify.httpErrors.badRequest("Missing fields");

    if (!db.getUserById(id_user) || !db.getUserById(id_block))
      throw fastify.httpErrors.conflict("User not found");

    if (db.ItIsBlock(id_user, id_block).length)
      throw fastify.httpErrors.conflict("User already blocked");

    if (db.alreadyFriend(id_user, id_block))
      db.deleteFriend(id_user, id_block);

    return db.createBlock(id_user, id_block);
  });

  fastify.post("/getBlock", async (request) => {
    const { id_user } = request.body as any;

    if (!id_user)
      throw fastify.httpErrors.badRequest("Missing fields");

    if (!db.getUserById(id_user))
      throw fastify.httpErrors.conflict("User not found");

    return db.getBlock(id_user);
  });

  fastify.post("/ItIsBlock", async (request) => {
    const { id_user, id_block } = request.body as any;

    if (!id_user || !id_block)
      throw fastify.httpErrors.badRequest("Missing fields");

    if (!db.getUserById(id_user) || !db.getUserById(id_block))
      throw fastify.httpErrors.conflict("User not found");

    return db.ItIsBlock(id_user, id_block);
  });

  fastify.post("/deleteBlock", async (request) => {
    const { id_user, id_block } = request.body as any;

    if (!id_user || !id_block)
      throw fastify.httpErrors.badRequest("Missing fields");

    if (!db.getUserById(id_user) || !db.getUserById(id_block))
      throw fastify.httpErrors.conflict("User not found");

    if (!db.ItIsBlock(id_user, id_block))
      throw fastify.httpErrors.conflict("User not blocked");

    return db.deleteBlock(id_user, id_block);
  });
}
