const PuppeteerCluster = require('../helpers/cluster');

const { TASK_ID, CARD_FRIENDLY_NAME } = process.env;

(async () => {
  const cluster = await PuppeteerCluster.build();
  cluster.queue({ taskId: TASK_ID, cardFriendlyName: CARD_FRIENDLY_NAME });
})();
