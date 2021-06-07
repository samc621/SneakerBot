const express = require('express');
const { validate } = require('express-validation');
const { validationRules, validationHandler } = require('./validation');

const router = express.Router();

const {
  createTask,
  getTask,
  getTasks,
  updateTask,
  deleteTask,
  startTask
} = require('./controller');
const {
  create,
  findOne,
  findAll,
  update,
  deleted,
  start
} = validationRules;

router
  .route('/')
  .post(validate(create), createTask, validationHandler)
  .get(validate(findAll), getTasks, validationHandler);

router
  .route('/:id/start')
  .post(validate(start), startTask, validationHandler);

router
  .route('/:id')
  .get(validate(findOne), getTask, validationHandler)
  .patch(validate(update), updateTask, validationHandler)
  .delete(validate(deleted), deleteTask, validationHandler);

module.exports = router;
