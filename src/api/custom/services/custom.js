'use strict';

/**
 * custom service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::custom.custom');
