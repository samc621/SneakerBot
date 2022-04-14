import { ValidationError } from 'express-validation';
import { BadRequest } from './server-response.js';

const handleValidationError = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    console.error(JSON.stringify(err));
    return BadRequest(res, err.message, err.details);
  }

  return next(err);
};

export default handleValidationError;
