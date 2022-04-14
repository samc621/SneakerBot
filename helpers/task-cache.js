const taskCache = {};

export const storePageInTaskCache = ({ taskId, page }) => {
  taskCache[taskId] = page;
};

export const retrievePageFromTaskCache = ({ taskId }) => {
  return taskCache[taskId];
};

export const removePageFromTaskCache = async ({ taskId }) => {
  const page = retrievePageFromTaskCache({ taskId });
  if (page) await page.close();
  delete taskCache[taskId];
};
