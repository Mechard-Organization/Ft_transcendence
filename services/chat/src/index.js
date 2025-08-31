import Fastify from 'fastify';
import websocket from '@fastify/websocket';

const app = Fastify({ logger: true });
await app.register(websocket);

const port = process.env.PORT || 3003;

app.get('/health', async () => ({ ok: true }));

app.get('/ws/chat', { websocket: true }, (conn/*, req*/) => {
  conn.socket.send('WS: hello from chat');
  conn.socket.on('message', (msg) => conn.socket.send(`echo:${msg}`));
});

app.listen({ host: '0.0.0.0', port }).then(() => {
  app.log.info(`chat up on ${port}`);
});
