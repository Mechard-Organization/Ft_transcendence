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
}
