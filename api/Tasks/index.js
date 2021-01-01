const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");

const {
  createTask,
  getTask,
  getTasks,
  updateTask,
  deleteTask,
  startTask
} = require("./controller");
const {
  create,
  findOne,
  findAll,
  update,
  deleted,
  start
} = require("./validation");

router
  .route("/")
  .post(validate(create), createTask)
  .get(validate(findAll), getTasks);

router.route("/:id/start").post(validate(start), startTask);

router
  .route("/:id")
  .get(validate(findOne), getTask)
  .patch(validate(update), updateTask)
  .delete(validate(deleted), deleteTask);

module.exports = router;
