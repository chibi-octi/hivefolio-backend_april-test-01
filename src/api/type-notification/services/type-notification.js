'use strict';

/**
 * type-notification service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::type-notification.type-notification');
