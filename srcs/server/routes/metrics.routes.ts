import { FastifyInstance } from "fastify";
import { register } from "../metrics";

export default async function metricsRoutes(fastify: FastifyInstance) {
  fastify.get("/metrics", async (_, reply) => {
    reply.type(register.contentType);
    return register.metrics();
  });
}
