const Task = require("./model");
const Proxy = require("../Proxies/model");
const Address = require("../Addresses/model");

const footsites = require("../../sites/footsites");
const nike = require("../../sites/nike");

const { testProxy, createProxyString } = require("../../helpers/proxies");
const { sendEmail } = require("../../helpers/email");
const response = require("../../helpers/server-response");

exports.createTask = async (req, res) => {
  try {
    const task = await new Task().create(req.body);

    return response.Ok(res, "Task successfully created", task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getTask = async (req, res) => {
  try {
    const id = req.params.id;
    const data = {};
    data["tasks.id"] = id;
    const task = await new Task().findOne(data);

    return response.Ok(res, "Task successfully found", task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await new Task().find(req.query);

    return response.Ok(res, "Tasks successfully found", tasks);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await new Task(id).update(req.body);

    return response.Ok(res, "Task successfully updated", task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await new Task(id).update({ is_deleted: true });

    return response.Ok(res, "Task successfully deleted", task);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.startTask = async (req, res) => {
  try {
    const id = req.params.id;
    const data = {};
    data["tasks.id"] = id;
    const task = await new Task().findOne(data);

    const proxies = await new Proxy().find({ has_been_used: false });

    const validProxy = proxies.find(async proxy => {
      const proxyString = createProxyString(proxy);
      if (await testProxy(proxyString)) {
        await new Proxy(proxy.id).update({ has_been_used: true });
        return true;
      }
      return false;
    });
    const proxy = validProxy ? createProxyString(validProxy) : null;

    const shippingAddress = await new Address().findOne({
      id: task.shipping_address_id
    });
    const billingAddress = await new Address().findOne({
      id: task.billing_address_id
    });

    const status = await require(`../../sites/${task.site_name}`).guestCheckout(
      task.url,
      proxy,
      task.style_index,
      task.size,
      shippingAddress,
      task.shipping_speed_index,
      billingAddress
    );

    let recipient = task.notification_email_address;
    let subject;
    let text;
    if (status.hasCaptcha) {
      subject = "Checkout task unsuccessful";
      text = `The checkout task for ${task.url} size ${task.size} has a captcha. Please open the browser to check on it.`;
    } else if (status.isInCart && !status.checkoutComplete) {
      subject = "Checkout task unsuccessful";
      text = `The checkout task for ${task.url} size ${task.size} has a checkout error. Please open the browser to check on it.`;
    } else if (status.checkoutComplete) {
      subject = "Checkout task successful";
      text = `The checkout task for ${task.url} size ${task.size} has completed.`;
    }
    await sendEmail(recipient, subject, text);

    return response.Ok(res, "Task successfully completed", status);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
