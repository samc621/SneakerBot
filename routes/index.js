const express = require('express');

const router = express.Router();

const addressesRoutes = require('../api/Addresses');
const proxiesRoutes = require('../api/Proxies');
const tasksRoutes = require('../api/Tasks');
const validationHandler = require('../helpers/validation-handler');

// router paths
const urlAddresses = '/addresses';
const urlProxies = '/proxies';
const urlTasks = '/tasks';

// routers
router.get('/', (req, res) => res.send('Welcome to the SneakerBot API'));
router.use(urlAddresses, addressesRoutes);
router.use(urlProxies, proxiesRoutes);
router.use(urlTasks, tasksRoutes);

// router handlers
router.use(validationHandler);

module.exports = {
  router,
  urlAddresses,
  urlProxies,
  urlTasks
};
