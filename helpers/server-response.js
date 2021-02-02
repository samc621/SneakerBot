exports.Ok = (res, message, data) => res.status(200).json({ success: true, message, data });

exports.BadRequest = (res, message) => res.status(400).json({ success: false, message, data: {} });

exports.Unauthorized = (res, message) => res.status(401).json({ success: false, message, data: {} });

exports.NotFound = (res, message) => res.status(404).json({ success: false, message, data: {} });

exports.InternalServerError = (res, message) => res.status(500).json({ success: false, message, data: {} });
