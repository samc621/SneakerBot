const { Joi } = require('express-validation');
const genericValidationHandler = require('../../helpers/validation-handler');

module.exports = {
  validationHandler: genericValidationHandler,
  validationRules: {
    create: {
      body: Joi.object({
        ip_address: Joi.string().required(),
        port: Joi.number().integer().optional(),
        protocol: Joi.string().required(),
        username: Joi.string().allow(null).optional(),
        password: Joi.string().allow(null).optional()
      })
    },
    findOne: {
      params: Joi.object({
        id: Joi.number().required()
      })
    },
    findAll: {
      query: Joi.object({
        protocol: Joi.string().optional()
      })
    },
    update: {
      params: Joi.object({
        id: Joi.number().required()
      }),
      body: Joi.object({
        ip_address: Joi.string().optional(),
        port: Joi.number().integer().optional(),
        protocol: Joi.string().optional(),
        username: Joi.string().allow(null).optional(),
        password: Joi.string().allow(null).optional()
      })
    },
    deleted: {
      params: Joi.object({
        id: Joi.number().required()
      })
    }
  }
};
