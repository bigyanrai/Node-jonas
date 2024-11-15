const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

const userRouter = express.Router();

//Routers

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);
userRouter.post(
  '/forgotPassword',
  authController.protect,
  authController.forgotPassword,
);
userRouter.patch('/resetPassword/:token', authController.resetPassword);

//This will protect all the routes that comes after this point or you can say after this middleware
userRouter.use(authController.protect);

userRouter.patch('/updateMypassword', authController.updatePassword);

userRouter.get(
  '/me',

  userController.getMe,
  userController.getUser,
);

//PHOTO UPLOAD

userRouter.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);

userRouter.delete('/deleteMe', userController.deleteMe);

userRouter.use(authController.restrictTo('admin'));

userRouter.route('/').get(userController.getAllUsers);
// .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
