import Fastify from "fastify";
const app = Fastify({ logger: true });

const PORT = process.env.PORT || 3000;

app.get("/auth/health", async () => ({ ok: true, svc: "auth" }));

// placeholders de routes (tu brancheras SQLite + JWT plus tard)
app.post("/auth/signup", async () => ({ ok: true }));
app.post("/auth/login", async () => ({ ok: true }));

app.listen({ host: "0.0.0.0", port: PORT }).then(() => {
  app.log.info(`auth up on ${PORT}`);
});
