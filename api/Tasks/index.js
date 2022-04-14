import express from 'express';
import { validate } from 'express-validation';
import { createTask, getTask, getTasks, updateTask, deleteTask, startTask, stopTask } from './controller.js';
import { create, findOne, findAll, update, deleted, start, stop } from './validation.js';

const router = express.Router();

router.route('/').post(validate(create), createTask).get(validate(findAll), getTasks);

router.route('/:id/start').post(validate(start), startTask);

router.route('/:id/stop').post(validate(stop), stopTask);

router.route('/:id').get(validate(findOne), getTask).patch(validate(update), updateTask).delete(validate(deleted), deleteTask);

export default router;
