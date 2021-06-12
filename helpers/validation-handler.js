const { ValidationError } = require('express-validation');
const { BadRequest, InternalServerError } = require('./server-response');

const genericValidationHandler = (err, req, res) => {
  console.error(JSON.stringify(err));
  if (err instanceof ValidationError) {
    return BadRequest(res, err.message, err.details);
  }

  return InternalServerError(res, err.message);
};

module.exports = {
  genericValidationHandler
};
