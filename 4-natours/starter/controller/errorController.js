const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //OPERATIONAL, TRUSTED ERROR:SEND MESSAGE TO CLIENT
  if (err.isOperational) {
    // console.log(err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //PROGRAMMING OR OTHER UNKNOWN ERROR: DON'T LEAK ERROR DETAILS
  } else {
    //LOG THE ERROR
    console.log(err);
    //SEND GENERIC MESSAGE

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  // console.log(new AppError(message, 400));

  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const value = err.keyValue.name;
  console.log(value);
  const message = `Duplicate fields of ${value}.Write another name`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid Token. Please Login again!', 401);
};

const handleJWTExpiredError = () => new AppError('Your token has expired', 401);

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;

    console.log(error);
    // console.log('LOOK AT THIS ERROR', error);
    console.dir(err);
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
      console.log(error.isOperational);
    }

    if (error.code === 11000) {
      error = handleDuplicateFields(error);
      console.log('hello');
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
      console.log('BREAKPOINT 1');
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }

    sendErrorProd(error, res);
  }
};
