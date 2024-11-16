const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const appError = require('./../utils/appError');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const Email = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConirm: req.body.passwordConirm,
  // });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  console.log('test');
  const { email, password } = req.body;

  //1.CHECK IF EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  //2.CHECK IF USER EXISTS AND PASSWORD IS CORRECT
  const user = await User.findOne({ email }).select('+password');
  // console.log(user);

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));
  //3.IF EVERYTHING IS OKAY SEND THE TOKEN TO CLIENT
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  //Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access'),
      401,
    );
  }

  //verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user still exits
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token the user no longer exits',
        401,
      ),
    );
  }
  //check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password!Please login again', 401),
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  // console.log(req.user);
  next();
});

// exports.protect = catchAsync(async (req, res, next) => {
//   // 1) Getting token and check of it's there
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     return next(
//       new AppError('You are not logged in! Please log in to get access.', 401),
//     );
//   }

//   // 2) Verification token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   // 3) Check if user still exists
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new AppError(
//         'The user belonging to this token does no longer exist.',
//         401,
//       ),
//     );
//   }

//   // 4) Check if user changed password after the token was issued
//   if (currentUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError('User recently changed password! Please log in again.', 401),
//     );
//   }

//   // GRANT ACCESS TO PROTECTED ROUTE
//   req.user = currentUser;
//   next();
// });
// //Only for rendered pages , no errors!!
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // console.log(req.cookies.jwt);
      //verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      //check if user still exits
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      //THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    }
  } catch (error) {
    return next();
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.GET USER BASED ON POSTED EMAIL
  // console.log(req.body.email);
  const user = await User.findOne({ email: req.body.email });
  // console.log(user);
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //2.GENERATE THE RANDOM RESET TOKEN

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // await user.save();

  //3.SEND IT TO THE USER'S EMAIL
  // const resetURL = `${req.protocol}://{req.get('host')/api/v1/users/resetPassword/${resetToken}}`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token(valid for 10 min)',
    //   message,
    // });
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token was sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email.Try again later', 500),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.GET USER BASED ON THE TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  //2.IF TOKEN HAS NOT EXPIRED, AND THERE IS USER,SET THE NEW PASSWORD
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3.UPDATE THE CHANGEDPASSWORDAT PROPERTY FOR THE USER
  console.log(user);
  //4. LOG THE USER IN , SEND JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1.GET USER FROM COLLECTION
  const user = await User.findById(req.user.id).select('+password');

  //2.CHECK IF POSTED CURRENT PASSWORD IS CORRECT
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong.', 401));
  //3.IF SO UPDATE PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4.LOG USER IN SEND JWT
  createSendToken(user, 200, res);
});
