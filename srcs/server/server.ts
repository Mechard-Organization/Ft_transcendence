import Fastify from "fastify";
import fs from "fs";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import sensible from "@fastify/sensible";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import messageRoutes from "./routes/messages.routes";
import friendRoutes from "./routes/friends.routes";
import metricsRoutes from "./routes/metrics.routes";
import websocketPlugin from "./plugin/websocket";

async function start() {
  const fastify = Fastify({logger: true});

  await fastify.register(cookie);
  await fastify.register(websocket);
  await fastify.register(sensible);

  // Routes
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(friendRoutes, { prefix: "/api/friend" });
  await fastify.register(userRoutes, { prefix: "/api" });
  await fastify.register(messageRoutes, { prefix: "/api" });
  await fastify.register(metricsRoutes);

  await fastify.register(websocketPlugin);

  await fastify.listen({ port: 4000, host: "0.0.0.0" });
  console.log("Backend running on http://localhost:4000");
}


start().catch(err => {
  console.error(err);
});
