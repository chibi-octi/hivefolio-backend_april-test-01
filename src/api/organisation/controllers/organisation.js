"use strict";

/**
 * organisation controller
 */
const { parseMultipartData, sanitize } = require("@strapi/utils");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::organisation.organisation",
  ({ strapi }) => ({
    // wrap a core action, leaving core logic in place
    async create(ctx) {
      let entity;
      // if (ctx.is("multipart")) {
      let { data, files } = parseMultipartData(ctx);

      if (!data || !data.name) {
        ctx.throw(400, "Please write a name");
      }

      // if (!files || !files.image_profile) {
      //   ctx.throw(400, "Please upload an Image");
      // }
      const { user } = ctx.state;

      entity = await strapi.entityService.create(
        "api::organisation.organisation",
        {
          data: { ...data, admins: [user], members: [user] },
          files,
        }
      );
      // } else {
      //   ctx.throw(400, "Please use multipart/form-data");
      // }

      // ctx.send(entity);
      // return { data: entity };
      const sanitizedEntity = await sanitize.contentAPI.output(entity);
      // console.log(sanitizedEntity);
      return { data: sanitizedEntity };
    },

    async update(ctx) {
      let entity;
      if (ctx.is("multipart")) {
        ctx.throw(400, "Please only make JSON request with an updated data");
      } else {
        const { id } = ctx.params;
        const { user } = ctx.state;
        const organisation = await strapi.db
          .query("api::organisation.organisation")
          .findOne({
            where: { id },
            populate: ["admins"],
          });
        if (!organisation) {
          ctx.throw(404, "organisation not found");
        }
        /* if (organisation?.admins.includes(user)) {
          ctx.throw(403, "You are not allowed to update this record");
        } */
        entity = await strapi.db
          .query("api::organisation.organisation")
          .update({
            where: { id },
            data: ctx.request.body.data,
          });
      }

      const sanitizedEntity = await sanitize.contentAPI.output(entity);
      // console.log(sanitizedEntity);
      return { data: sanitizedEntity };
    },

    async delete(ctx) {
      const { id } = ctx.params;
      const { user } = ctx.state;
      const organisation = await strapi.db
        .query("api::organisation.organisation")
        .findOne({
          where: { id },
          populate: ["admins"],
        });
      if (!organisation) {
        ctx.throw(404, "organisation not found");
      }
      if (organisation.admins.includes(user)) {
        ctx.throw(403, "You are not allowed to delete this record");
      }
      let entity;
      entity = await strapi.db.query("api::organisation.organisation").delete({
        where: { id },
      });
      const sanitizedEntity = await sanitize.contentAPI.output(entity);
      // console.log(sanitizedEntity);
      return { data: sanitizedEntity };
    },
  })
);
