import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";

export default async function friendRoutes(fastify: FastifyInstance) {

  fastify.post("/friend", async (request) => {
    const { id_user, id_friend, id_sender } = request.body as any;

    if (db.alreadyFriend(id_user, id_friend).length)
      throw fastify.httpErrors.conflict("Already friend");

    const user = db.createFriend(id_user, id_friend, id_sender);

    fastify.websocketServer.clients.forEach(c => {
      if (c.readyState === 1) {
        c.send(JSON.stringify({ type: "friend", data: user }));
      }
    });

    return user;
  });

  fastify.post("/getFriendV", async (request) => {
    const { id } = request.body as any;
    return db.getFriendValidate(id);
  });

  fastify.post("/getFriendNV", async (request) => {
    const { id } = request.body as any;
    return db.getFriendNValidate(id);
  });

  fastify.post("/acceptFriend", async (request) => {
    const { id_user, id_friend } = request.body as any;
    const info = db.valideFriend(id_user, id_friend);
    let group = db.createGroup().id;
    db.addUserGroup(group, id_user);
    db.addUserGroup(group, id_friend);
    return info;
  });

  fastify.post("/delFriend", async (request) => {
    const { id_user, id_friend } = request.body as any;
    return db.deleteFriend(id_user, id_friend);
  });
}
