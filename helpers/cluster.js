const { Cluster } = require('puppeteer-cluster');

const Task = require('../api/Tasks/model');
const Proxy = require('../api/Proxies/model');
const Address = require('../api/Addresses/model');

const { testProxy, createProxyString } = require('./proxies');
const { sendEmail } = require('./email');

const sites = require('../sites');

class PuppeteerCluster {
  static async build() {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_BROWSER,
      maxConcurrency: process.env.PARALLEL_TASKS || 1,
      timeout: 5 * 60 * 1000,
      puppeteerOptions: {
        headless: false,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      }
    });

    cluster.task(async ({ page, data: taskId }) => {
      try {
        const data = {};
        data['tasks.id'] = taskId;
        const task = await new Task().findOne(data);

        const proxies = await new Proxy().find({ has_been_used: false });

        const validProxy = proxies.find(async (proxy) => {
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

        const checkoutComplete = await sites[task.site_name].guestCheckout(
          page,
          task.url,
          proxy,
          task.style_index,
          task.size,
          shippingAddress,
          task.shipping_speed_index,
          billingAddress,
          task.auto_solve_captchas,
          task.notification_email_address
        );

        const recipient = task.notification_email_address;
        let subject;
        let text;
        if (!checkoutComplete) {
          subject = 'Checkout task unsuccessful';
          text = `
            The checkout task for ${task.url} size ${task.size} has a checkout error. 
            Please open the browser to check on it within 5 minutes.
          `;
        } else {
          subject = 'Checkout task successful';
          text = `The checkout task for ${task.url} size ${task.size} has completed.`;
        }
        await sendEmail(recipient, subject, text);

        if (!checkoutComplete) {
          await page.waitForTimeout(5 * 60 * 1000);
        }
      } catch (err) {
        console.error(err.messsage);
      }
    });

    return cluster;
  }
}

module.exports = PuppeteerCluster;
