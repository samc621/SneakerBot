import express from 'express';
import { validate } from 'express-validation';
import { createAddress, getAddress, getAddresses, updateAddress, deleteAddress } from './controller.js';
import { create, findOne, findAll, update, deleted } from './validation.js';

const router = express.Router();

router.route('/').post(validate(create), createAddress).get(validate(findAll), getAddresses);

router.route('/:id').get(validate(findOne), getAddress).patch(validate(update), updateAddress).delete(validate(deleted), deleteAddress);

export default router;
