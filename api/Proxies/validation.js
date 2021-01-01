const Joi = require("joi");

module.exports = {
  create: {
    body: {
      ip_address: Joi.string().required(),
      port: Joi.number().integer().optional(),
      protocol: Joi.string().required(),
      username: Joi.string().optional(),
      password: Joi.string().optional()
    }
  },
  findOne: {
    params: {
      id: Joi.number().required()
    }
  },
  findAll: {
    query: {
      protocol: Joi.string().optional()
    }
  },
  update: {
    params: {
      id: Joi.number().required()
    },
    body: {
      ip_address: Joi.string().optional(),
      port: Joi.number().integer().optional(),
      protocol: Joi.string().optional(),
      username: Joi.string().optional(),
      password: Joi.string().optional()
    }
  },
  deleted: {
    params: {
      id: Joi.number().required()
    }
  }
};
