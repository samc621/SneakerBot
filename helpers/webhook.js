const rp = require('request-promise');

const webhookEndpoint = process.env.WEBHOOK_ENDPOINT;

exports.sendWebhookEvent = async (data) => {
  try {
    if (!webhookEndpoint) {
      return;
    }

    const options = {
      uri: webhookEndpoint,
      method: 'POST',
      body: data,
      json: true
    };

    await rp(options);
  } catch (err) {
    throw err;
  }
};
