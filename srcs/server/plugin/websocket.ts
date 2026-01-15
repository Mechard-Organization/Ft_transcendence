import { FastifyInstance } from "fastify";
import WebSocket from "ws"; // <-- pas "import type"
import * as gameLogic from "../gameLogic";

export default async function websocketPlugin(fastify: FastifyInstance) {
  // ⚠ Ne pas réenregistrer websocket ici, déjà fait dans server.ts
  fastify.get("/ws/", { websocket: true }, (connection: any, _request) => {
    const ws: WebSocket = connection;

    ws.send(JSON.stringify({ type: "welcome" }));

    ws.on("message", (msg: string | Buffer) => {
		let message: any;

      	try {
			message = typeof msg === "string" ? JSON.parse(msg) : JSON.parse(msg.toString());
		} catch {
			console.warn("Received non-JSON message");
		return;
		}

    	switch (message.type) {
		case "wsMessage":
			// Si tu as besoin de stocker la socket pour ce joueur
			message.player.ws = ws;

			// Appel de ton gameLogic pour gérer le message
			gameLogic.movePaddlesAndBalls(message);
			break;

		case "newGame":
			console.log("New game:", message.newGame);
			break;

		case "wsChat":
			console.log("Message reçu :", msg.toString());

			// Exemple : broadcast à tous les autres clients
			fastify.websocketServer.clients.forEach(client => {
				if (client.readyState === 1) {
					client.send(JSON.stringify({ type: "msg", payload: msg.toString() }));
				}
			});
			break;

		case "wsFriend":
			console.log("Message reçu :", msg.toString());

			// Exemple : broadcast à tous les autres clients
			fastify.websocketServer.clients.forEach(client => {
				if (client.readyState === 1) {
					client.send(JSON.stringify({ type: "friend", payload: msg.toString() }));
				}
			});
			break;

		default:
			console.warn("Unknown message type:", message.type);
		}
    });
	  ws.on("close", () => {
		const player = gameLogic.removePlayerByWS(ws);
	});
  });
}

