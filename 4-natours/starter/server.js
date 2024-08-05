//START SERVER

const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});

//app must be imported before configuring .env file in the process.env using dotenv package
const app = require('./app');
// process.env.USERNAME = process.env.USERNAME || 'bigyan';
// console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`APP IS RUNNING AT PORT ${port}`);
});
