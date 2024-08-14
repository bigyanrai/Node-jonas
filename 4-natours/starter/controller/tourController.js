const { json } = require('express');
const Tour = require('./../models/tourModel');

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

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    //BUILD  QUERY
    //1.filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => {
      delete queryObj[el];
    });

    //2.advance filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    console.log(JSON.parse(queryStr));
    // console.log(req.query, queryObj);
    let query = Tour.find(JSON.parse(queryStr));

    //2.sorting

    if (req.query.sort) {
      //1. first method
      // console.log(req.query.sort);
      // let sort = sort.replace(',', ' ');
      // console.log(sort);
      // query = query.sort(sort);

      console.log(req.query.sort);
      let sort = req.query.sort.replace(',', ' ');
      console.log(sort);
      query = query.sort(sort);
      //sort('price ratingsAverage')
    } else {
      query = query.sort('-createdAt');
    }

    //3.field limting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //4.pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query.skip(skip).limit(limit);
    //execute query
    const tours = await query;
    // {difficuly:'easy',duration:{$gte:5}}

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // console.log(req.params);

    const id = req.params.id;
    console.log(id);
    const tours = await Tour.findById(id);

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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      satuts: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const result = await Tour.findByIdAndDelete(req.params.id);

    res.status(200).json({
      satuts: 'success',
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
