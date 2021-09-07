const nodemailer = require("nodemailer");
const nodemailerSendgrid = require("nodemailer-sendgrid");
require("dotenv").config();

const sendEmail = async (email, subject, text) => {
  try {
    const transport = nodemailer.createTransport(
      nodemailerSendgrid({
        apiKey: process.env.SENDGRID_API_KEY,
      })
    );
    await transport.sendMail({
      //   from: process.env.USER,
      from: "aditya007547@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
    console.log("email sent successfully");
  } catch (err) {
    console.error(err.response.body);
  }
};
module.exports = sendEmail;
