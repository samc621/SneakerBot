const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");

const {
  createProxy,
  getProxy,
  getProxies,
  updateProxy,
  deleteProxy
} = require("./controller");
const { create, findOne, findAll, update, deleted } = require("./validation");

router
  .route("/")
  .post(validate(create), createProxy)
  .get(validate(findAll), getProxies);

router
  .route("/:id")
  .get(validate(findOne), getProxy)
  .patch(validate(update), updateProxy)
  .delete(validate(deleted), deleteProxy);

module.exports = router;
