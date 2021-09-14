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
  .post(validate(create), createAddress)
  .get(validate(findAll), getAddresses);

router
  .route('/:id')
  .get(validate(findOne), getAddress)
  .patch(validate(update), updateAddress)
  .delete(validate(deleted), deleteAddress);

router.use(validationHandler);

module.exports = router;
