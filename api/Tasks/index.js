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
  .post(validate(create), validationHandler, createTask)
  .get(validate(findAll), validationHandler, getTasks);

router
  .route('/:id/start')
  .post(validate(start), validationHandler, startTask);

router
  .route('/:id')
  .get(validate(findOne), validationHandler, getTask)
  .patch(validate(update), validationHandler, updateTask)
  .delete(validate(deleted), validationHandler, deleteTask);

module.exports = router;
