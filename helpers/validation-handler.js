const { ValidationError } = require('express-validation');
const { BadRequest } = require('./server-response');

module.exports = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    console.error(err);
    return BadRequest(res, err.message, err.details);
  }

  return next(err);
};
