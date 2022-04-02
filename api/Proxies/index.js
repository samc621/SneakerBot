import express from 'express';
import { validate } from 'express-validation';
import { createProxy, getProxy, getProxies, updateProxy, deleteProxy } from './controller.js';
import { create, findOne, findAll, update, deleted } from './validation.js';

const router = express.Router();

router.route('/').post(validate(create), createProxy).get(validate(findAll), getProxies);

router.route('/:id').get(validate(findOne), getProxy).patch(validate(update), updateProxy).delete(validate(deleted), deleteProxy);

export default router;
