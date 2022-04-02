import PuppeteerCluster from '../../helpers/cluster.js';
import Task from './model.js';
import { Ok, InternalServerError } from '../../helpers/server-response.js';
import { removePageFromTaskCache } from '../../helpers/task-cache.js';

let cluster;
(async () => {
  cluster = await PuppeteerCluster.build();
})();

const result = (total) => (total ? 'successfully' : 'not');

export const createTask = async (req, res) => {
  try {
    const task = await new Task().create(req.body);

    return Ok(res, 'Task successfully created', task);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {};
    data['tasks.id'] = id;
    const task = await new Task().findOne(data);

    return Ok(res, `Task ${result(task)} found`, task);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await new Task().find(req.query);

    return Ok(res, `Tasks ${result(tasks.length)} found`, tasks);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await new Task(id).update(req.body);

    return Ok(res, `Task ${result(task)} updated`, task);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await new Task(id).update({ is_deleted: true });

    return Ok(res, `Task ${result(task)} deleted`, task);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const startTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { card_friendly_name } = req.body;
    const task = cluster.queue({ taskId: id, cardFriendlyName: card_friendly_name });

    return Ok(res, `Task ${result(task)} started`, task);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const stopTask = async (req, res) => {
  try {
    const { id } = req.params;
    await removePageFromTaskCache({ taskId: id });

    return Ok(res, 'Task successfully stopped', {});
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};
