"use strict";

/**
 * followuser controller
 */
const { parseMultipartData, sanitize } = require("@strapi/utils");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::followuser.followuser",
  ({ strapi }) => ({
    // wrap a core action, leaving core logic in place
    async create(ctx) {
      let entity;

      const userfollower = ctx.state.user; //Logged in User
      const { user } = ctx.request.body;

      //   console.log(userfollower);
      if (typeof user !== "number") {
        ctx.throw(400, "Please only pass the id for the user");
      }

      const realUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user },
        });
      // console.log(realUser);
      if (!realUser) {
        ctx.throw(400, "This user doesn't exist");
      }

      const found = await strapi.db
        .query("api::follow-user-follower.follow-user-follower")
        .findOne({
          where: { user: userfollower.id, user },
        });
      // console.log(found);
      if (found) {
        ctx.throw(400, "You already followed this user");
      }

      if (ctx.is("multipart")) {
        ctx.throw(400, "Only make JSON requests");
      } else {
        entity = await strapi.entityService.create(
          "api::followuser.followuser",
          {
            data: { user, userfollower },
          }
        );
        // console.log(entity);
        const follow_user_follower = await strapi.entityService.create(
          "api::follow-user-follower.follow-user-follower",
          {
            data: {
              user,
              userfollower: userfollower.id,
              followuser: entity.id,
            },
          }
        );
      }

      //Update the follow counter
      const { followcounts } = realUser;
      // console.log(followcounts);
      const updatedPost = await strapi.db
        .query("plugin::users-permissions.user")
        .update({
          where: {
            id: user,
          },
          data: {
            followcounts: followcounts + 1,
          },
        });
      const sanitizedEntity = await sanitize.contentAPI.output(entity);
      return { data: sanitizedEntity };
    },
    async delete(ctx) {
      const userfollower = ctx.state.user; //Logged in User
      const { id } = ctx.params;

      // console.log(id, user);
      const user = parseInt(id);

      const realUser = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({
          where: { id: user },
        });
      // console.log(realUser);
      if (!realUser) {
        ctx.throw(400, "This user doesn't exist");
      }
      // console.log(user, user);
      const userId = userfollower.id;
      console.log(user, userId);
      const follow_user_follower = await strapi.db
        .query("api::follow-user-follower.follow-user-follower")
        .delete({
          where: { user, userfollower: userId },
        });
      if (!follow_user_follower) {
        ctx.throw(400, "Something went wrong");
      }
      const entity = await strapi.db
        .query("api::followuser.followuser")
        .delete({
          where: { id: follow_user_follower.followuser },
        });
      const { followcounts } = realUser;
      // console.log(followcounts);
      const updatedPost = await strapi.db
        .query("plugin::users-permissions.user")
        .update({
          where: {
            id: user,
          },
          data: {
            followcounts: followcounts - 1,
          },
        });
      const sanitizedEntity = await sanitize.contentAPI.output(entity);
      return { data: sanitizedEntity };
    },
  })
);
