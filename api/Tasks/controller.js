const Task = require('./model');
const PuppeteerCluster = require('../../helpers/cluster');
const response = require('../../helpers/server-response');
const { removePageFromTaskCache } = require('../../helpers/task-cache');

let cluster;
(async () => {
  cluster = await PuppeteerCluster.build();
})();

const result = (total) => (total ? 'successfully' : 'not');

exports.createTask = async (req, res) => {
  try {
    const task = await new Task().create(req.body);

    return response.Ok(res, 'Task successfully created', task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {};
    data['tasks.id'] = id;
    const task = await new Task().findOne(data);

    return response.Ok(res, `Task ${result(task)} found`, task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await new Task().find(req.query);

    return response.Ok(res, `Tasks ${result(tasks.length)} found`, tasks);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await new Task(id).update(req.body);

    return response.Ok(res, `Task ${result(task)} updated`, task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await new Task(id).update({ is_deleted: true });

    return response.Ok(res, `Task ${result(task)} deleted`, task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.startTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { card_friendly_name } = req.body;
    const task = cluster.queue({ taskId: id, cardFriendlyName: card_friendly_name });

    return response.Ok(res, `Task ${result(task)} started`, task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.stopTask = async (req, res) => {
  try {
    const { id } = req.params;
    await removePageFromTaskCache({ taskId: id });

    return response.Ok(res, 'Task successfully stopped', {});
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
