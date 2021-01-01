const Joi = require("joi");

module.exports = {
  create: {
    body: {
      type: Joi.string().valid("billing", "shipping").required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      address_line_1: Joi.string().required(),
      address_line_2: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postal_code: Joi.string().required(),
      country: Joi.string().required(),
      email_address: Joi.string().email().required(),
      phone_number: Joi.string().required()
    }
  },
  findOne: {
    params: {
      id: Joi.number().required()
    }
  },
  findAll: {
    query: {
      type: Joi.string().valid("billing", "shipping").optional()
    }
  },
  update: {
    params: {
      id: Joi.number().required()
    },
    body: {
      type: Joi.string().valid("billing", "shipping").optional(),
      first_name: Joi.string().optional(),
      last_name: Joi.string().optional(),
      address_line_1: Joi.string().optional(),
      address_line_2: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      postal_code: Joi.string().optional(),
      country: Joi.string().optional(),
      email_address: Joi.string().email().optional(),
      phone_number: Joi.string().optional()
    }
  },
  deleted: {
    params: {
      id: Joi.number().required()
    }
  }
};
