const { json } = require('express');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

//ROUTE HANDLERS

//NO NEED TO CHECK ID SINCE WE ARE USING DATABASE DIRECTLY WITHOUT POSTMAN
// exports.checkID = (req, res, nex, val) => {
//   console.log(`Tour id is : ${val}`);
//   if (req.params.id * 1 > tours.length)
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid id',
//     });
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //execute query
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;
  // {difficuly:'easy',duration:{$gte:5}}

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
  // try {
  //   //BUILD  QUERY
  //   //1.filtering
  //   // const queryObj = { ...req.query };
  //   // const excludeFields = ['page', 'sort', 'limit', 'fields'];
  //   // excludeFields.forEach((el) => {
  //   //   delete queryObj[el];
  //   // });
  //   // //2.advance filtering
  //   // let queryStr = JSON.stringify(queryObj);
  //   // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  //   // console.log(JSON.parse(queryStr));
  //   // // console.log(req.query, queryObj);
  //   // let query = Tour.find(JSON.parse(queryStr));
  //   //2.sorting
  //   // if (req.query.sort) {
  //   //   //1. first method
  //   //   // console.log(req.query.sort);
  //   //   // let sort = sort.replace(',', ' ');
  //   //   // console.log(sort);
  //   //   // query = query.sort(sort);
  //   //   console.log(req.query.sort);
  //   //   let sort = req.query.sort.replace(',', ' ');
  //   //   console.log(sort);
  //   //   query = query.sort(sort);
  //   //   //sort('price ratingsAverage')
  //   // } else {
  //   //   query = query.sort('-createdAt');
  //   // }
  //   //3.field limting
  //   // if (req.query.fields) {
  //   //   const fields = req.query.fields.split(',').join(' ');
  //   //   query = query.select(fields);
  //   // } else {
  //   //   query = query.select('-__v');
  //   // }
  //   //4.pagination
  //   // const page = req.query.page * 1 || 1;
  //   // const limit = req.query.limit * 1 || 100;
  //   // const skip = (page - 1) * limit;
  //   // query.skip(skip).limit(limit);
  //   // if (req.query.page) {
  //   //   const numTours = await Tour.countDocuments();
  //   //   if (skip >= numTours) throw new Error('This page doesnt exits');
  //   // }
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  // console.log(id);
  const tours = await Tour.findById(id);

  if (!tours) {
    return next(new AppError('No tour found with that ID'), 404);
  }
  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  // try {
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID'), 404);
  }
  res.status(200).json({
    satuts: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const result = await Tour.findByIdAndDelete(req.params.id);
  if (!result) {
    return next(new AppError('No tour found with that ID'), 404);
  }
  res.status(200).json({
    satuts: 'success',
    data: result,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    satuts: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    satuts: 'success',
    data: plan,
  });
});
