"use strict";

/**
 * followcommunity controller
 */
const { parseMultipartData, sanitize } = require("@strapi/utils");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::followcommunity.followcommunity",
  ({ strapi }) => ({
    // wrap a core action, leaving core logic in place
    async create(ctx) {
      let entity;

      const { user } = ctx.state; //Logged in User
      const { community } = ctx.request.body; //Id of community

      // console.log(user);
      if (typeof community !== "number") {
        ctx.throw(400, "Please only pass the id for the community");
      }

      const realCommunity = await strapi.db
        .query("api::community.community")
        .findOne({
          where: { id: community },
        });
      // console.log(realCommunity);
      if (!realCommunity) {
        ctx.throw(400, "This community doesn't exist");
      }

      const found = await strapi.db
        .query("api::follow-user-community.follow-user-community")
        .findOne({
          where: { user: user.id, community },
        });
      // console.log(found);
      if (found) {
        ctx.throw(400, "You already followed this community");
      }

      if (ctx.is("multipart")) {
        ctx.throw(400, "Only make JSON requests");
      } else {
        entity = await strapi.entityService.create(
          "api::followcommunity.followcommunity",
          {
            data: { community, user },
          }
        );
        // console.log(entity);
        const follow_user_community = await strapi.entityService.create(
          "api::follow-user-community.follow-user-community",
          {
            data: { community, user: user.id, followcommunity: entity.id },
          }
        );
      }

      //Update the follow counter
      const { follows } = realCommunity;
      const updatedPost = await strapi.db
        .query("api::community.community")
        .update({
          where: {
            id: community,
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
      const community = parseInt(id);

      const realCommunity = await strapi.db
        .query("api::community.community")
        .findOne({
          where: { id: community },
        });
      // console.log(realCommunity);
      if (!realCommunity) {
        ctx.throw(400, "This community doesn't exist");
      }
      // console.log(user, community);
      const userId = user.id;
      // console.log(community, userId);
      const follow_user_community = await strapi.db
        .query("api::follow-user-community.follow-user-community")
        .delete({
          where: { community, user: userId },
        });
      if (!follow_user_community) {
        ctx.throw(400, "Something went wrong");
      }
      const entity = await strapi.db
        .query("api::followcommunity.followcommunity")
        .delete({
          where: { id: follow_user_community.followcommunity },
        });
      const { follows } = realCommunity;
      console.log(follows);
      const updatedPost = await strapi.db
        .query("api::community.community")
        .update({
          where: {
            id: community,
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
