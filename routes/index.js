const express = require('express');

const router = express.Router();

const addressesRoutes = require('../api/Addresses');
const proxiesRoutes = require('../api/Proxies');
const tasksRoutes = require('../api/Tasks');
const validationHandler = require('../helpers/validation-handler');

// routers
router.get('/', (req, res) => res.send('Welcome to the SneakerBot API'));
router.use('/addresses', addressesRoutes);
router.use('/proxies', proxiesRoutes);
router.use('/tasks', tasksRoutes);

// router handlers
router.use(validationHandler);

module.exports = router;
