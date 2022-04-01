const axios = require('axios').default;

const webhookEndpoint = process.env.WEBHOOK_ENDPOINT;

exports.sendWebhookEvent = async (data) => {
  try {
    if (!webhookEndpoint) {
      return;
    }

    await axios.post(webhookEndpoint, data);
  } catch (err) {
    console.error('Error sending webhook event', err);
  }
};
