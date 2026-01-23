import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";

export default async function messageRoutes(fastify: FastifyInstance) {

  fastify.post("/messages", async (request) => {
    const { id_group } = request.body as any;
    return db.getAllMessages(id_group);
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
    let group;
    const id_invit = db.getUserByUsername(user);

    if (!id_invit) {
      throw fastify.httpErrors.badRequest("Invalid user");
    }

    if (!id_group)
    {}
    group = db.createGroup().id;
    console.log(group);
    // const saved1 = db.addUsereGroup(id, id_group);
    // const saved2 = db.addUsereGroup(id_invit, id_group);
    const saved = db.addMessage( user + " has join the group", id, id_group);

    // fastify.websocketServer.clients.forEach(client => {
    //   if (client.readyState === 1) {
    //     client.send(JSON.stringify({ type: "new_message", data: { saved1, saved2 } }));
    //   }
    // });

    return { saved };
  });
}
