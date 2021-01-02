const Joi = require("joi");

module.exports = {
  create: {
    body: Joi.object({
      site_id: Joi.number().integer().required(),
      url: Joi.string().required(),
      style_index: Joi.number().integer().required(),
      size: Joi.number().required(),
      shipping_speed_index: Joi.number().integer().required(),
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
      size: Joi.number().optional(),
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
      style_index: Joi.number().integer().optional(),
      size: Joi.number().optional(),
      shipping_speed_index: Joi.number().integer().optional(),
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
    })
  }
};
