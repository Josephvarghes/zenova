// import httpStatus from 'http-status';

// class APIError extends Error {
// 	constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR, isOperational = true) {
// 		// If message is an array (like Joi validation), take first readable message
// 		const finalMessage = Array.isArray(message)
// 			? message[0]?.message || 'Something went wrong'
// 			: message || 'Something went wrong';

// 		super(finalMessage);

// 		this.status = status;
// 		this.isOperational = isOperational;

// 		// Always keep uniform structure
// 		this.success = false;
// 		this.data = {};
// 		this.message = finalMessage;

// 		// Error.captureStackTrace(this, this.constructor);
// 	}
// }

// export default APIError;
// src/utils/apiError.js
import httpStatus from 'http-status';

class APIError extends Error {
  constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR, isOperational = true) {
    // Handle Joi validation errors (array of errors)
    const finalMessage = Array.isArray(message)
      ? message[0]?.message || 'Something went wrong'
      : message || 'Something went wrong';

    super(finalMessage);

    this.status = status;
    this.isOperational = isOperational;
    this.success = false;
    this.data = {};
    this.message = finalMessage;
  }
}

export default APIError;