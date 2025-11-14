import { createServer, IncomingMessage, ServerResponse } from "http";

const port = 4000;

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.url === "/api/hello" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello from backend without Express!" }));
    return;
  }

  // Route par défaut
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
