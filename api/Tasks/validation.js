import { Joi } from 'express-validation';

export const create = {
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
};

export const findOne = {
  params: Joi.object({
    id: Joi.number().required()
  })
};

export const findAll = {
  query: Joi.object({
    site_id: Joi.number().integer().optional(),
    url: Joi.string().optional(),
    size: Joi.string().optional(),
    billing_address_id: Joi.number().integer().optional(),
    shipping_address_id: Joi.number().integer().optional(),
    notification_email_address: Joi.string().email().optional()
  })
};

export const update = {
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
};

export const deleted = {
  params: Joi.object({
    id: Joi.number().required()
  })
};

export const start = {
  params: Joi.object({
    id: Joi.number().required()
  }),
  body: Joi.object({
    card_friendly_name: Joi.string().optional()
  })
};

export const stop = {
  params: Joi.object({
    id: Joi.number().required()
  })
};
