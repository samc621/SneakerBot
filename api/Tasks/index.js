const express = require('express');
const { validate } = require('express-validation');
const { createTask, getTask, getTasks, updateTask, deleteTask, startTask, stopTask } = require('./controller');
const { create, findOne, findAll, update, deleted, start, stop } = require('./validation');

const router = express.Router();

router.route('/').post(validate(create), createTask).get(validate(findAll), getTasks);

router.route('/:id/start').post(validate(start), startTask);

router.route('/:id/stop').post(validate(stop), stopTask);

router.route('/:id').get(validate(findOne), getTask).patch(validate(update), updateTask).delete(validate(deleted), deleteTask);

module.exports = router;
