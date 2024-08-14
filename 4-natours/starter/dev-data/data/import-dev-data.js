//START SERVER
const fs = require('fs');
const mongoose = require('mongoose');
//app must be imported before configuring .env file in the process.env using dotenv package
const Tour = require('../../models/tourModel');

const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection succesfull');
  });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

//IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded');
  } catch (error) {
    console.log(error);
  }
};

//DELETE ALL DATA FROM COLLECTION

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

console.log(process.argv);

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
