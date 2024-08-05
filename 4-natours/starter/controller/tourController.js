const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//ROUTE HANDLERS
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.json({
      success: false,
      message: "Didn't find body or price",
    });
  next();
};

exports.checkID = (req, res, nex, val) => {
  console.log(`Tour id is : ${val}`);
  if (req.params.id * 1 > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  // console.log(req.params);

  const id = req.params.id * 1;
  // console.log(id);

  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  const tour = tours.find((el) => {
    return el.id === id;
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

exports.createTour = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
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
