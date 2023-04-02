"use strict";

/**
 * followcharacter controller
 */
const { parseMultipartData, sanitize } = require("@strapi/utils");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::followcharacter.followcharacter",
  ({ strapi }) => ({
    // wrap a core action, leaving core logic in place
    async create(ctx) {
      let entity;

      const { user } = ctx.state; //Logged in User
      const { character } = ctx.request.body; //Id of character

      // console.log(user);
      if (typeof character !== "number") {
        ctx.throw(400, "Please only pass the id for the character");
      }

      const realCharacter = await strapi.db
        .query("api::character.character")
        .findOne({
          where: { id: character },
        });
      // console.log(realCharacter);
      if (!realCharacter) {
        ctx.throw(400, "This character doesn't exist");
      }

      const found = await strapi.db
        .query("api::follow-user-character.follow-user-character")
        .findOne({
          where: { user: user.id, character },
        });
      // console.log(found);
      if (found) {
        ctx.throw(400, "You already followed this character");
      }

      if (ctx.is("multipart")) {
        ctx.throw(400, "Only make JSON requests");
      } else {
        entity = await strapi.entityService.create(
          "api::followcharacter.followcharacter",
          {
            data: { character, user },
          }
        );
        // console.log(entity);
        const follow_user_character = await strapi.entityService.create(
          "api::follow-user-character.follow-user-character",
          {
            data: { character, user: user.id, followcharacter: entity.id },
          }
        );
      }

      //Update the follow counter
      const { follows } = realCharacter;
      const updatedPost = await strapi.db
        .query("api::character.character")
        .update({
          where: {
            id: character,
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
      const character = parseInt(id);

      const realCharacter = await strapi.db
        .query("api::character.character")
        .findOne({
          where: { id: character },
        });
      // console.log(realCharacter);
      if (!realCharacter) {
        ctx.throw(400, "This character doesn't exist");
      }
      // console.log(user, character);
      const userId = user.id;
      // console.log(character, userId);
      const follow_user_character = await strapi.db
        .query("api::follow-user-character.follow-user-character")
        .delete({
          where: { character, user: userId },
        });
      if (!follow_user_character) {
        ctx.throw(400, "Something went wrong");
      }
      const entity = await strapi.db
        .query("api::followcharacter.followcharacter")
        .delete({
          where: { id: follow_user_character.followcharacter },
        });
      const { follows } = realCharacter;
      // console.log(follows);
      const updatedPost = await strapi.db
        .query("api::character.character")
        .update({
          where: {
            id: character,
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
