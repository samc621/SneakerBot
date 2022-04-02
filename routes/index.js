import express from 'express';
import addressesRoutes from '../api/Addresses/index.js';
import proxiesRoutes from '../api/Proxies/index.js';
import tasksRoutes from '../api/Tasks/index.js';
import validationHandler from '../helpers/validation-handler.js';

const router = express.Router();

// routers
router.get('/', (req, res) => res.send('Welcome to the SneakerBot API'));
router.use('/addresses', addressesRoutes);
router.use('/proxies', proxiesRoutes);
router.use('/tasks', tasksRoutes);

// router handlers
router.use(validationHandler);

export default router;
