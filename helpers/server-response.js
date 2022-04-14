export const Ok = (res, message, data, statusCode) => {
  return res.status(statusCode || 200).json({ success: true, message, data });
};

export const BadRequest = (res, message, data = {}) => {
  return res.status(400).json({ success: false, message, data });
};

export const Unauthorized = (res, message) => {
  return res.status(401).json({ success: false, message, data: {} });
};

export const Forbidden = (res, message, data = {}) => {
  return res.status(403).json({ success: false, message, data });
};

export const NotFound = (res, message) => {
  return res.status(404).json({ success: false, message, data: {} });
};

export const InternalServerError = (res, message) => {
  return res.status(500).json({ success: false, message, data: {} });
};
