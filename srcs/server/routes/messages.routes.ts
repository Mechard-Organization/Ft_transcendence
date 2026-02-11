import { FastifyInstance } from "fastify";
import * as db from "@config/database/db";

export default async function messageRoutes(fastify: FastifyInstance) {

  fastify.post("/messages", async (request) => {
    const { id_group } = request.body as any;
    let saved: any;
    if (id_group)
      saved = db.getMessagesInGroup(id_group);
    else
      saved = db.getAllMessages();
    return saved;
  });

  fastify.post("/hello", async (request) => {
    const { content, id, id_group } = request.body as any;

    if (!content || typeof content !== "string") {
      throw fastify.httpErrors.badRequest("Invalid content");
    }

    const info = db.addMessage(content, id, id_group);
    const saved = db.getMessagesById(info.id);
    console.log("hello saved: ", saved);

    fastify.websocketServer.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "new_message", data: {saved, id_group} }));
      }
    });

    return saved;
  });

  fastify.post("/creatGroup", async (request) => {
    const { user, me, id_group } = request.body as any;
    let group = id_group;

    if (!user || !me) {
      throw fastify.httpErrors.badRequest("Invalid user");
    }

    if (!id_group)
    {
      const old_group = db.oldGroup(me.id, user.id);
      if (old_group)
          return {group: old_group.id_group};
      group = db.createGroup(user.username).id;
      db.addUserGroup(group, me.id);
      db.addMessage( me.username + " has join the group", user.id, group);
    }
    db.addUserGroup(group, user.id);
    const saved = db.addMessage( user.username + " has join the group", me.id, group);

    fastify.websocketServer.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "new_message", data: {saved, id_group: group} }));
      }
    });

    return {group};
  });

  fastify.post("/addUserToGroup", async (request) => {
    const { user, me, id_group } = request.body as any;
    let group: any;

    if (!user || !me) {
      throw fastify.httpErrors.badRequest("Invalid user");
    }

    if (!id_group)
    {
      throw fastify.httpErrors.badRequest("Invalid group");
    }

    if (db.userInGroup(id_group, user.id))
    {
      throw fastify.httpErrors.badRequest("alredy in the group");
    }

    if (db.YRFriend(me.id, user.id))
    {
      throw fastify.httpErrors.badRequest("alredy in the group");
    }


    let lgroup = db.getGroup(id_group);
    let newg: boolean;

    if (lgroup.length === 2)
    {
      group = db.createGroup(me.username + "'s team");
      lgroup.map((g: any) => {
        db.addUserGroup(group.id, g.id_user);
        db.addMessage( me.username + " has join the group", g.id_user, group.id);
      })
      group = db.getGroup(group.id)[0]
      newg = true;
    }
    else
    {
      group = lgroup[0];
      newg = false;
    }

    db.addUserGroup(group.id, user.id);
    const saved = db.addMessage( user.username + " has join the group", me.id, group.id);

    fastify.websocketServer.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "new_message", data: {saved, id_group: group.id} }));
      }
    });
    return {group, newg};
  });


  fastify.post("/getAllUserGroup", async (request) => {
    const { id } = request.body as any;

    if (!id) {
      throw fastify.httpErrors.badRequest("Invalid user");
    }
    return db.getAllUserGroup(id);
  });

  fastify.post("/UserInGroup", async (request) => {
    const { id, id_group } = request.body as any;
    let group;

    if (!id) {
      throw fastify.httpErrors.badRequest("Invalid user");
    }

    if (!id_group)
    {
      throw fastify.httpErrors.badRequest("Invalid group");
    }
    const saved = db.userInGroup(id_group, id);

    return {saved};
  });

}
