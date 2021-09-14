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
  .post(validate(create), createProxy)
  .get(validate(findAll), getProxies);

router
  .route('/:id')
  .get(validate(findOne), getProxy)
  .patch(validate(update), updateProxy)
  .delete(validate(deleted), deleteProxy);

router.use(validationHandler);

module.exports = router;
