import Fastify from "fastify";
const app = Fastify({ logger: true });

const PORT = process.env.PORT || 3000;

app.get("/api/health", async () => ({ ok: true, svc: "gateway" }));

// Exemple d'endpoint public
app.get("/api/hello", async (req, reply) => {
  return { msg: "hello from gateway" };
});

app.listen({ host: "0.0.0.0", port: PORT }).then(() => {
  app.log.info(`gateway up on ${PORT}`);
});
