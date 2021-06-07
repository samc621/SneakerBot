const { ValidationError, Joi } = require('express-validation');
const response = require('../../helpers/server-response');

const validationHandler = (err, req, res, next) => {
  console.error(JSON.stringify(err));
  if (err instanceof ValidationError) {
    return response.BadRequest(res, err.message, err.details);
  }

  return response.InternalServerError(res, err.message);
};

module.exports = {
  validationHandler,
  validationRules: {
    create: {
      body: Joi.object({
        type: Joi.string().valid('billing', 'shipping').required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        address_line_1: Joi.string().required(),
        address_line_2: Joi.string().allow('').optional(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postal_code: Joi.string().required(),
        country: Joi.string().required(),
        email_address: Joi.string().email().required(),
        phone_number: Joi.string().required()
      })
    },
    findOne: {
      params: Joi.object({
        id: Joi.number().required()
      })
    },
    findAll: {
      query: Joi.object({
        type: Joi.string().valid('billing', 'shipping').optional()
      })
    },
    update: {
      params: Joi.object({
        id: Joi.number().required()
      }),
      body: Joi.object({
        type: Joi.string().valid('billing', 'shipping').optional(),
        first_name: Joi.string().optional(),
        last_name: Joi.string().optional(),
        address_line_1: Joi.string().optional(),
        address_line_2: Joi.string().allow('').optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        postal_code: Joi.string().optional(),
        country: Joi.string().optional(),
        email_address: Joi.string().email().optional(),
        phone_number: Joi.string().optional()
      })
    },
    deleted: {
      params: Joi.object({
        id: Joi.number().required()
      })
    }
  }
};