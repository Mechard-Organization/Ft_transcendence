import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";


export default async function userRoutes(fastify: FastifyInstance) {
  //GESTION DES MATCHS

	fastify.post("/match", async (request) => {
		const { name_player1, name_player2, score1, score2 } = request.body as any;

		return db.createMatch(name_player1, name_player2, score1, score2);
	});

	fastify.post("/getMatch", async (request) => {
		const { name_player } = request.body as any;

		if (!name_player)
		throw fastify.httpErrors.badRequest("Missing fields");

		if (!db.getUserByUsername(name_player))
		throw fastify.httpErrors.conflict("User don't exists");

		return db.getMatch(name_player);
	});

    fastify.post("/numMatch", async (request) => {
		const { name_player } = request.body as any;

		if (!name_player)
		throw fastify.httpErrors.badRequest("Missing fields");

		if (!db.getUserByUsername(name_player))
		throw fastify.httpErrors.conflict("User don't exists");

		return db.numMatch(name_player);
  	});

	fastify.post("/numWinMatch", async (request) => {
		const { name_player } = request.body as any;

		if (!name_player)
		throw fastify.httpErrors.badRequest("Missing fields");

		if (!db.getUserByUsername(name_player))
		throw fastify.httpErrors.conflict("User don't exists");

		return db.numWinMatch(name_player);
  	});

	fastify.post("/highScoreMatch", async (request) => {
		const { name_player } = request.body as any;

		if (!name_player)
		throw fastify.httpErrors.badRequest("Missing fields");

		if (!db.getUserByUsername(name_player))
		throw fastify.httpErrors.conflict("User don't exists");

		return db.highScoreMatch(name_player);
  	});

	fastify.post("/updateGroupName", async (request) => {
		const { name, id_group } = request.body as any;

		if (!name || !id_group)
		throw fastify.httpErrors.badRequest("Missing fields");

		return db.updateGroupName(name, id_group);
  	});

	fastify.post("/inviteMatch", async (request) => {
		const { username, advname, gameId } = request.body as any;

		if (!username || !advname || !gameId)
			throw fastify.httpErrors.badRequest("Missing fields");
		const user = db.getUserByUsername(username);
		const adv = db.getUserByUsername(advname);
		let groupId = db.oldGroup(user.id, adv.id)?.id_group;
		if (!groupId)
		{
			groupId = db.createGroup(adv.username).id;
    		db.addUserGroup(groupId, user.id);
			db.addMessage( user.username + " has join the group", adv.id, groupId);
    		db.addUserGroup(groupId, adv.id);
			db.addMessage( adv.username + " has join the group", user.id, groupId);
		}
		const saved = db.addMessage( user.username + " challenges you to a duel\n game id: " + gameId, user.id , groupId);
		fastify.websocketServer.clients.forEach(client => {
			if (client.readyState === 1) {
				client.send(JSON.stringify({ type: "new_message", data: {saved, id_group: groupId} }));
			}
		});
		return;
  	});
}
