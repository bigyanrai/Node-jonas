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
    const tours = await Tour.find();
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
      message: 'Invalid data sent',
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    satuts: 'success',
    data: {
      tour: '<updated tour here....>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    satuts: 'success',
    data: null,
  });
};