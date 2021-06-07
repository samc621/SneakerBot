const express = require('express');
const { validate } = require('express-validation');
const { validationRules, validationHandler } = require('./validation');

const router = express.Router();

const {
  createProxy,
  getProxy,
  getProxies,
  updateProxy,
  deleteProxy
} = require('./controller');
const {
  create,
  findOne,
  findAll,
  update,
  deleted
} = validationRules;

router
  .route('/')
  .post(validate(create), createProxy, validationHandler)
  .get(validate(findAll), getProxies, validationHandler);

router
  .route('/:id')
  .get(validate(findOne), getProxy, validationHandler)
  .patch(validate(update), updateProxy, validationHandler)
  .delete(validate(deleted), deleteProxy, validationHandler);

module.exports = router;
