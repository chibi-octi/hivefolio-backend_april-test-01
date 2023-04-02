"use strict";

/**
 * follow controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { parseMultipartData, sanitize } = require("@strapi/utils");

module.exports = createCoreController("api::follow.follow", ({ strapi }) => ({
  // wrap a core action, leaving core logic in place
  async create(ctx) {
    let entity;

    const { user } = ctx.state; //Logged in User
    const { team } = ctx.request.body; //Id of team

    // console.log(user);
    if (typeof team !== "number") {
      ctx.throw(400, "Please only pass the id for the team");
    }

    const realTeam = await strapi.db.query("api::team.team").findOne({
      where: { id: team },
    });
    // console.log(realTeam);
    if (!realTeam) {
      ctx.throw(400, "This team doesn't exist");
    }

    const found = await strapi.db
      .query("api::follow-user-team.follow-user-team")
      .findOne({
        where: { user: user.id, team },
      });
    // console.log(found);
    if (found) {
      ctx.throw(400, "You already followed this team");
    }

    if (ctx.is("multipart")) {
      ctx.throw(400, "Only make JSON requests");
    } else {
      entity = await strapi.entityService.create("api::follow.follow", {
        data: { team, user },
      });
      // console.log(entity);
      const follow_user_team = await strapi.entityService.create(
        "api::follow-user-team.follow-user-team",
        {
          data: { team, user: user.id, follow: entity.id },
        }
      );
    }

    //Update the follow counter
    const { follows } = realTeam;
    const updatedPost = await strapi.db.query("api::team.team").update({
      where: {
        id: team,
      },
      data: {
        follows: follows + 1,
      },
    });
    const sanitizedEntity = await sanitize.contentAPI.output(entity);
    return { data: sanitizedEntity };
  },
  async delete(ctx) {
    const { user } = ctx.state;
    const { id } = ctx.params;

    // console.log(id, user);
    const team = parseInt(id);

    const realTeam = await strapi.db.query("api::team.team").findOne({
      where: { id: team },
    });
    // console.log(realTeam);
    if (!realTeam) {
      ctx.throw(400, "This team doesn't exist");
    }
    // console.log(user, team);
    const userId = user.id;
    console.log(team, userId);
    const follow_user_team = await strapi.db
      .query("api::follow-user-team.follow-user-team")
      .delete({
        where: { team, user: userId },
      });
    // console.log(follow_user_team, !follow_user_team);
    if (!follow_user_team) {
      ctx.throw(400, "Something went wrong");
    }
    const entity = await strapi.db.query("api::follow.follow").delete({
      where: { id: follow_user_team.follow },
    });
    const { follows } = realTeam;
    // console.log(follows);
    const updatedPost = await strapi.db.query("api::team.team").update({
      where: {
        id: team,
      },
      data: {
        follows: follows - 1,
      },
    });
    const sanitizedEntity = await sanitize.contentAPI.output(entity);
    return { data: sanitizedEntity };
  },
}));
