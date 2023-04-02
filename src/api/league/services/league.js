'use strict';

/**
 * league service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::league.league');
