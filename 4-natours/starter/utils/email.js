const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Bigyan Rai <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.Node_ENV === 'production') {
      //Sendgrid
      return nodemailer.createTransport({
        service: 'Sendgrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    //1.CREATE A TRANSPORTER
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // tls: {
      //   rejectUnauthorized: false,
      // },
    });
  }

  //SEND THE ACTUAL EMAIL
  async send(template, subject) {
    //RENDER HTML BASED ON PUG TEMPLATE
    const html = pug.renderFile(`${__dirname}/../Views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //DEFINE EMAIL OPTIONS
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    //CREATE A TRANSPORT AND SEND EMAIL

    this.newTransport();
    await this.newTransport().sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  }
  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the natours family!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)',
    );
  }
};
