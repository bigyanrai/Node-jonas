//START SERVER
const mongoose = require('mongoose');

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
  .then((con) => {
    console.log(con.connections);
    console.log('DB connection succesfull');
  });
//app must be imported before configuring .env file in the process.env using dotenv package
const app = require('./app');
// process.env.USERNAME = process.env.USERNAME || 'bigyan';
// console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`APP IS RUNNING AT PORT ${port}`);
});
