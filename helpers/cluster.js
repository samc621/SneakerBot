const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Cluster } = require('puppeteer-cluster');

const Task = require('../api/Tasks/model');
const Proxy = require('../api/Proxies/model');
const Address = require('../api/Addresses/model');

const { testProxy, createProxyString } = require('./proxies');
const { sendEmail } = require('./email');
const Logger = require('./logger');

const sites = require('../sites');

puppeteer.use(StealthPlugin());

class PuppeteerCluster {
  static async build() {
    const puppeteerOptions = {
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    };
    if (process.env.NODE_ENV === 'docker') {
      puppeteerOptions.executablePath = '/usr/bin/google-chrome-stable';
    }
    const cluster = await Cluster.launch({
      puppeteer,
      concurrency: Cluster.CONCURRENCY_BROWSER,
      maxConcurrency: parseInt(process.env.PARALLEL_TASKS) || 1,
      timeout: 5 * 60 * 1000,
      puppeteerOptions
    });

    cluster.task(async ({ page, data: { taskId, cardFriendlyName } }) => {
      let taskLogger;
      try {
        const data = {};
        data['tasks.id'] = taskId;
        const task = await new Task().findOne(data);

        const {
          id,
          shipping_address_id,
          billing_address_id,
          site_name,
          url,
          size,
          style_index,
          shipping_speed_index,
          auto_solve_captchas,
          notification_email_address
        } = task;

        taskLogger = new Logger().startTaskLogger(id);

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
        if (proxy) {
          taskLogger.info('Using proxy', proxy);
        }

        const shippingAddress = await new Address().findOne({
          id: shipping_address_id
        });
        const billingAddress = await new Address().findOne({
          id: billing_address_id
        });

        const checkoutComplete = await sites[site_name].guestCheckout({
          taskLogger,
          page,
          url,
          proxy,
          styleIndex: style_index,
          size,
          shippingAddress,
          shippingSpeedIndex: shipping_speed_index,
          billingAddress,
          autoSolveCaptchas: auto_solve_captchas,
          notificationEmailAddress: notification_email_address,
          cardFriendlyName
        });

        const recipient = notification_email_address;
        let subject;
        let text;
        if (!checkoutComplete) {
          subject = 'Checkout task unsuccessful';
          text = `
            The checkout task for ${url} size ${size} has a checkout error. 
            Please open the browser to check on it within 5 minutes.
          `;
        } else {
          subject = 'Checkout task successful';
          text = `The checkout task for ${url} size ${size} has completed.`;
        }
        await sendEmail({ recipient, subject, text });
        taskLogger.info(text);

        if (!checkoutComplete) {
          await page.waitForTimeout(5 * 60 * 1000);
        }
      } catch (err) {
        taskLogger.error(err);
      }
    });

    return cluster;
  }
}

module.exports = PuppeteerCluster;
