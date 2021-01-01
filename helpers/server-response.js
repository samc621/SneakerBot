exports.Ok = (res, message, data) => {
  return res.status(200).json({ success: true, message, data });
};

exports.BadRequest = (res, message) => {
  return res.status(400).json({ success: false, message, data: {} });
};

exports.Unauthorized = (res, message) => {
  return res.status(401).json({ success: false, message, data: {} });
};

exports.NotFound = (res, message) => {
  return res.status(404).json({ success: false, message, data: {} });
};

exports.InternalServerError = (res, message) => {
  return res.status(500).json({ success: false, message, data: {} });
};
