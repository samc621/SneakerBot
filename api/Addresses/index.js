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
  .post(validate(create), validationHandler, createAddress)
  .get(validate(findAll), validationHandler, getAddresses);

router
  .route('/:id')
  .get(validate(findOne), validationHandler, getAddress)
  .patch(validate(update), validationHandler, updateAddress)
  .delete(validate(deleted), validationHandler, deleteAddress);

module.exports = router;
