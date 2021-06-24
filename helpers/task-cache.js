const taskCache = {};

exports.storePageInTaskCache = ({ taskId, page }) => {
  taskCache[taskId] = page;
};

exports.retrievePageFromTaskCache = ({ taskId }) => {
  const page = taskCache[taskId];
  return page || undefined;
};

exports.removePageFromTaskCache = async ({ taskId }) => {
  const page = this.retrievePageFromTaskCache({ taskId });
  if (page) await page.close();
  delete taskCache[taskId];
};
