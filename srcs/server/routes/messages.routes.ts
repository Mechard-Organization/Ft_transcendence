import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";

export default async function messageRoutes(fastify: FastifyInstance) {

  fastify.get("/messages", async () => {
    return db.getAllMessages();
  });

  fastify.post("/hello", async (request) => {
    const { content, id } = request.body as any;

    if (!content || typeof content !== "string") {
      throw fastify.httpErrors.badRequest("Invalid content");
    }

    const saved = db.addMessage(content, id);

    fastify.websocketServer.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "new_message", data: saved }));
      }
    });

    return saved;
  });
}
