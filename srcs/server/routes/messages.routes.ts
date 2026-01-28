import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";

export default async function messageRoutes(fastify: FastifyInstance) {

  fastify.post("/messages", async (request) => {
    const { id_group } = request.body as any;
    let saved: any;
    if (id_group)
      saved = db.getMessagesInGroup(id_group);
    else
      saved = db.getAllMessages();
    return saved;
  });

  fastify.post("/hello", async (request) => {
    const { content, id, id_group } = request.body as any;

    if (!content || typeof content !== "string") {
      throw fastify.httpErrors.badRequest("Invalid content");
    }

    const saved = db.addMessage(content, id, id_group);

    fastify.websocketServer.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "new_message", data: saved }));
      }
    });

    return saved;
  });

  fastify.post("/addUserToGroup", async (request) => {
    const { user, id, id_group } = request.body as any;
    let group = id_group;

    if (!user.id || !id) {
      throw fastify.httpErrors.badRequest("Invalid user");
    }
    console.log(user, id, id_group);
    if (!id_group)
    {
      const old_group = db.oldGroup(id, user.id);
      console.log(old_group);
      if (old_group)
          return {group: old_group.id_group};
      group = db.createGroup().id;
      db.addUserGroup(group, id);
      console.log(group, id);
    }
    db.addUserGroup(group, user.id);
    const saved = db.addMessage( user.username + " has join the group", id, group);

    fastify.websocketServer.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "new_message", data: { saved } }));
      }
    });

    return {group};
  });

  fastify.post("/UserInGroup", async (request) => {
    const { id, id_group } = request.body as any;
    let group;

    if (!id) {
      throw fastify.httpErrors.badRequest("Invalid user");
    }

    if (!id_group)
    {
      throw fastify.httpErrors.badRequest("Invalid group");
    }
    const saved = db.userInGroup(id_group, id);

    return {saved};
  });
}
