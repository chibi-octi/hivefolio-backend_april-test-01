"use strict";

/**
 * followgame controller
 */
const { parseMultipartData, sanitize } = require("@strapi/utils");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::followgame.followgame",
  ({ strapi }) => ({
    // wrap a core action, leaving core logic in place
    async create(ctx) {
      let entity;

      const { user } = ctx.state; //Logged in User
      const { game } = ctx.request.body; //Id of game

      // console.log(user);
      if (typeof game !== "number") {
        ctx.throw(400, "Please only pass the id for the game");
      }

      const realGame = await strapi.db.query("api::game.game").findOne({
        where: { id: game },
      });
      // console.log(realGame);
      if (!realGame) {
        ctx.throw(400, "This game doesn't exist");
      }

      const found = await strapi.db
        .query("api::follow-user-game.follow-user-game")
        .findOne({
          where: { user: user.id, game },
        });
      // console.log(found);
      if (found) {
        ctx.throw(400, "You already followed this game");
      }

      if (ctx.is("multipart")) {
        ctx.throw(400, "Only make JSON requests");
      } else {
        entity = await strapi.entityService.create(
          "api::followgame.followgame",
          {
            data: { game, user },
          }
        );
        // console.log(entity);
        const follow_user_game = await strapi.entityService.create(
          "api::follow-user-game.follow-user-game",
          {
            data: { game, user: user.id, followgame: entity.id },
          }
        );
      }

      //Update the follow counter
      const { follows } = realGame;
      const updatedPost = await strapi.db.query("api::game.game").update({
        where: {
          id: game,
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
      const game = parseInt(id);

      const realGame = await strapi.db.query("api::game.game").findOne({
        where: { id: game },
      });
      // console.log(realGame);
      if (!realGame) {
        ctx.throw(400, "This game doesn't exist");
      }
      // console.log(user, game);
      const userId = user.id;
      // console.log(game, userId);
      const follow_user_game = await strapi.db
        .query("api::follow-user-game.follow-user-game")
        .delete({
          where: { game, user: userId },
        });
      if (!follow_user_game) {
        ctx.throw(400, "Something went wrong");
      }
      const entity = await strapi.db
        .query("api::followgame.followgame")
        .delete({
          where: { id: follow_user_game.followgame },
        });
      const { follows } = realGame;
      //   console.log(follows);
      const updatedPost = await strapi.db.query("api::game.game").update({
        where: {
          id: game,
        },
        data: {
          follows: follows - 1,
        },
      });
      const sanitizedEntity = await sanitize.contentAPI.output(entity);
      return { data: sanitizedEntity };
    },
  })
);
