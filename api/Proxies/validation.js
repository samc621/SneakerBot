import { Joi } from 'express-validation';

export const create = {
  body: Joi.object({
    ip_address: Joi.string().required(),
    port: Joi.number().integer().optional(),
    protocol: Joi.string().required(),
    username: Joi.string().allow(null).optional(),
    password: Joi.string().allow(null).optional()
  })
};

export const findOne = {
  params: Joi.object({
    id: Joi.number().required()
  })
};

export const findAll = {
  query: Joi.object({
    protocol: Joi.string().optional()
  })
};

export const update = {
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
};

export const deleted = {
  params: Joi.object({
    id: Joi.number().required()
  })
};
