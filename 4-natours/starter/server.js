//START SERVER
const mongoose = require('mongoose');
//app must be imported before configuring .env file in the process.env using dotenv package
const app = require('./app');
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
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection succesfull');
  });
// .catch((err) => console.log(err));
// process.env.USERNAME = process.env.USERNAME || 'bigyan';
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`APP IS RUNNING AT PORT ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`UNHANDLED REJECTION........SHUTTING DOWN`);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
