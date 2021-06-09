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
  .post(validate(create), validationHandler, createProxy)
  .get(validate(findAll), validationHandler, getProxies);

router
  .route('/:id')
  .get(validate(findOne), validationHandler, getProxy)
  .patch(validate(update), validationHandler, updateProxy)
  .delete(validate(deleted), validationHandler, deleteProxy);

module.exports = router;
