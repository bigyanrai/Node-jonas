const nodemailer = require('nodemailer');
const sendEmail = (options) => {
  //1.CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  //2.DEFINE THE EMAIL OPTIONS
  const mailOptions = {
    from: 'from Bigyan Rai <hello@bigyan.com> ',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:,
  };
  //3.SEND THE EMAIL WITH NODEMAILER
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = sendEmail;
