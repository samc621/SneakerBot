import axios from 'axios';

const webhookEndpoint = process.env.WEBHOOK_ENDPOINT;

const sendWebhookEvent = async (data) => {
  try {
    if (!webhookEndpoint) {
      return;
    }

    await axios.post(webhookEndpoint, data);
  } catch (err) {
    console.error('Error sending webhook event', err);
  }
};

export default sendWebhookEvent;
