// import morgan from 'morgan';

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log(`UNCAUGHT EXCEPTION.......SHUTTING DOWN`);

  process.exit(1);
});

const dotenv = require('dotenv');
dotenv.config({
  path: './config.env',
});

const { fail } = require('assert');
const path = require('path');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoute.js');
const viewRouter = require('./routes/viewRoute.js');
const bookingRouter = require('./routes/bookingRoute.js');
const rateLimit = require('express-rate-limit');
const appError = require('./utils/appError.js');
const globalErrorHandler = require('./controller/errorController.js');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//MIDDLEWARES
//SET SECURITY HTTP HEADERS
app.use(helmet());
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//LIMITS REQUEST FOR SAME API
const limiter = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: `Too many requests from this IP, please try again in an hour!`,
});

app.use('/api', limiter);

//BODY PARSER,READING DATA FROM BODY INTO REQ.BODY
app.use(
  express.json({
    limit: '10kb',
  }),
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

//DATA SANITIZATION AGAINST XSS ATTACKS
app.use(xss());
//SERVING STATIC FILES

//PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// TO CHANGE CSP POLICY SO THAT EXTERNAL SCRIPTS CAN BE LOADED

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  );
  next();
});
// Allow scripts from Stripe
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://js.stripe.com;",
  );
  next();
});

//SEVERS STATIC FILES
// app.use(express.static(`${__dirname}/public`));

//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//route handling

// app.get('/api/v1/tours/', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//ROUTES

//BACKEND ROUTE
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl}`,
  // });

  next(new appError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
