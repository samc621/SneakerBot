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
        site_id: Joi.number().integer().required(),
        url: Joi.string().required(),
        product_code: Joi.string().allow(null).optional(),
        style_index: Joi.number().integer().allow(null).optional(),
        size: Joi.string().allow(null).optional(),
        shipping_speed_index: Joi.number().integer().allow(null).optional(),
        billing_address_id: Joi.number().integer().required(),
        shipping_address_id: Joi.number().integer().required(),
        notification_email_address: Joi.string().email().allow(null).optional()
      })
    },
    findOne: {
      params: Joi.object({
        id: Joi.number().required()
      })
    },
    findAll: {
      query: Joi.object({
        site_id: Joi.number().integer().optional(),
        url: Joi.string().optional(),
        size: Joi.string().optional(),
        billing_address_id: Joi.number().integer().optional(),
        shipping_address_id: Joi.number().integer().optional(),
        notification_email_address: Joi.string().email().optional()
      })
    },
    update: {
      params: Joi.object({
        id: Joi.number().required()
      }),
      body: Joi.object({
        site_id: Joi.number().integer().optional(),
        url: Joi.string().optional(),
        product_code: Joi.string().optional(),
        style_index: Joi.number().integer().allow(null).optional(),
        size: Joi.string().allow(null).optional(),
        shipping_speed_index: Joi.number().integer().allow(null).optional(),
        billing_address_id: Joi.number().integer().optional(),
        shipping_address_id: Joi.number().integer().optional(),
        notification_email_address: Joi.string().email().allow(null).optional()
      })
    },
    deleted: {
      params: Joi.object({
        id: Joi.number().required()
      })
    },
    start: {
      params: Joi.object({
        id: Joi.number().required()
      }),
      body: Joi.object({
        card_friendly_name: Joi.string().optional()
      })
    }
  }
};
