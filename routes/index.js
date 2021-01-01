const express = require("express");
const router = express.Router();

const addressesRoutes = require("../api/Addresses");
const proxiesRoutes = require("../api/Proxies");
const tasksRoutes = require("../api/Tasks");

router.get("/", (req, res, next) => res.send("Welcome to the SneakerBot API"));
router.use("/addresses", addressesRoutes);
router.use("/proxies", proxiesRoutes);
router.use("/tasks", tasksRoutes);

module.exports = router;
