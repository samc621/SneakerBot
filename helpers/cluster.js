import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Cluster } from 'puppeteer-cluster';
import proxyChain from 'proxy-chain';
import Ua from 'puppeteer-extra-plugin-anonymize-ua';
import UserAgent from 'user-agents';

import Task from '../api/Tasks/model.js';
import Proxy from '../api/Proxies/model.js';
import Address from '../api/Addresses/model.js';

import { testProxy, createProxyString } from './proxies.js';
import sendEmail from './email.js';
import sendWebhookEvent from './webhook.js';
import Logger from './logger.js';
import { storePageInTaskCache } from './task-cache.js';

import sites from '../sites/index.js';

const userAgent = new UserAgent();

puppeteer.use(StealthPlugin());
puppeteer.use(Ua());

class PuppeteerCluster {
  static async build() {
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
    let newProxyUrl;
    if (proxy) {
      newProxyUrl = await proxyChain.anonymizeProxy(proxy);
    }

    const puppeteerOptions = {
      headless: false,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        `--user-agent=${userAgent}`
      ]
    };
    if (process.env.NODE_ENV === 'docker') {
      puppeteerOptions.executablePath = '/usr/bin/google-chrome-stable';
    }
    if (newProxyUrl) {
      puppeteerOptions.args.push(`--proxy-server=${newProxyUrl}`);
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
          product_code,
          size,
          style_index,
          shipping_speed_index,
          auto_solve_captchas,
          notification_email_address
        } = task;

        taskLogger = await new Logger().startTaskLogger(id);
        storePageInTaskCache({ taskId, page });

        if (newProxyUrl) {
          taskLogger.info(`Using anonymized proxy URL: ${newProxyUrl}`);
        }

        const shippingAddress = await new Address().findOne({
          id: shipping_address_id
        });
        const billingAddress = await new Address().findOne({
          id: billing_address_id
        });

        const checkoutComplete = await sites[site_name]({
          taskLogger,
          page,
          url,
          productCode: product_code,
          proxy: newProxyUrl,
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

        const webhookPayload = {
          taskId,
          checkoutComplete,
          message: text
        };
        await sendWebhookEvent(webhookPayload);

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

export default PuppeteerCluster;
