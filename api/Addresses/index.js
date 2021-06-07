const express = require('express');
const { validate } = require('express-validation');
const { validationRules, validationHandler } = require('./validation');

const router = express.Router();

const {
  createAddress,
  getAddress,
  getAddresses,
  updateAddress,
  deleteAddress
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
  .post(validate(create), createAddress, validationHandler)
  .get(validate(findAll), getAddresses, validationHandler);

router
  .route('/:id')
  .get(validate(findOne), getAddress, validationHandler)
  .patch(validate(update), updateAddress, validationHandler)
  .delete(validate(deleted), deleteAddress, validationHandler);

module.exports = router;
