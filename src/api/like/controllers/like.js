"use strict";

/**
 * like controller
 */
const { parseMultipartData, sanitize } = require("@strapi/utils");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::like.like", ({ strapi }) => ({
  // wrap a core action, leaving core logic in place
  async create(ctx) {
    let entity;

    const { user } = ctx.state; //Logged in User
    const { team } = ctx.request.body; //Id of team

    // console.log(team);
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
      .query("api::like-user-team.like-user-team")
      .findOne({
        where: { user: user.id, team },
      });
    // console.log(found);
    if (found) {
      ctx.throw(400, "You already followed this team");
    }

    // console.log(team, user);
    if (ctx.is("multipart")) {
      ctx.throw(400, "Only make JSON requests");
    } else {
      entity = await strapi.entityService.create("api::like.like", {
        data: { team, user: user.id },
      });
      // console.log(entity);
      const like_user_team = await strapi.entityService.create(
        "api::like-user-team.like-user-team",
        {
          data: { team, user: user.id, like: entity.id },
        }
      );
    }

    //Update the follow counter
    const { likes } = realTeam;
    const updatedPost = await strapi.db.query("api::team.team").update({
      where: {
        id: team,
      },
      data: {
        //     likes: likes + 1,
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
    // console.log(team, userId);
    const like_user_team = await strapi.db
      .query("api::like-user-team.like-user-team")
      .delete({
        where: { team, user: userId },
      });
    if (!like_user_team) {
      ctx.throw(400, "Something went wrong");
    }
    console.log(like_user_team);
    const entity = await strapi.db.query("api::like.like").delete({
      where: { id: like_user_team.like },
    });
    console.log(entity);
    const { likes } = realTeam;
    // console.log(likes);
    const updatedPost = await strapi.db.query("api::team.team").update({
      where: {
        id: team,
      },
      data: {
        likes: likes - 1,
      },
    });
    const sanitizedEntity = await sanitize.contentAPI.output(entity);
    return { data: sanitizedEntity };
  },
}));
