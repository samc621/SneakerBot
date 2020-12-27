require("dotenv-flow").config();
const nodemailer = require("nodemailer");

exports.sendEmail = async (to, subject, text) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === 465 ? true : false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    let info = await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      text
    });

    return info.messageId;
  } catch (err) {
    throw new Error(err.message);
  }
};
