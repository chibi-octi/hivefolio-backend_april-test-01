"use strict";

/**
 * followorganisation controller
 */
const { parseMultipartData, sanitize } = require("@strapi/utils");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::followorganisation.followorganisation",
  ({ strapi }) => ({
    // wrap a core action, leaving core logic in place
    async create(ctx) {
      let entity;

      const { user } = ctx.state; //Logged in User
      const { organisation } = ctx.request.body; //Id of organisation

      // console.log(user);
      if (typeof organisation !== "number") {
        ctx.throw(400, "Please only pass the id for the organisation");
      }

      const realOrganisation = await strapi.db
        .query("api::organisation.organisation")
        .findOne({
          where: { id: organisation },
        });
      // console.log(realOrganisation);
      if (!realOrganisation) {
        ctx.throw(400, "This organisation doesn't exist");
      }

      const found = await strapi.db
        .query("api::follow-user-organisation.follow-user-organisation")
        .findOne({
          where: { user: user.id, organisation },
        });
      // console.log(found);
      if (found) {
        ctx.throw(400, "You already followed this organisation");
      }

      if (ctx.is("multipart")) {
        ctx.throw(400, "Only make JSON requests");
      } else {
        entity = await strapi.entityService.create(
          "api::followorganisation.followorganisation",
          {
            data: { organisation, user },
          }
        );
        // console.log(entity);
        const follow_user_organisation = await strapi.entityService.create(
          "api::follow-user-organisation.follow-user-organisation",
          {
            data: {
              organisation,
              user: user.id,
              followorganisation: entity.id,
            },
          }
        );
      }

      //Update the follow counter
      const { follows } = realOrganisation;
      const updatedPost = await strapi.db
        .query("api::organisation.organisation")
        .update({
          where: {
            id: organisation,
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
      const organisation = parseInt(id);

      const realOrganisation = await strapi.db
        .query("api::organisation.organisation")
        .findOne({
          where: { id: organisation },
        });
      // console.log(realOrganisation);
      if (!realOrganisation) {
        ctx.throw(400, "This organisation doesn't exist");
      }
      // console.log(user, organisation);
      const userId = user.id;
      // console.log(organisation, userId);
      const follow_user_organisation = await strapi.db
        .query("api::follow-user-organisation.follow-user-organisation")
        .delete({
          where: { organisation, user: userId },
        });
      if (!follow_user_organisation) {
        ctx.throw(400, "Something went wrong");
      }
      const entity = await strapi.db
        .query("api::followorganisation.followorganisation")
        .delete({
          where: { id: follow_user_organisation.followorganisation },
        });
      const { follows } = realOrganisation;
      // console.log(follows);
      const updatedPost = await strapi.db
        .query("api::organisation.organisation")
        .update({
          where: {
            id: organisation,
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
