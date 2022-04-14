import nodemailer from 'nodemailer';

const sendEmail = async ({ recipient: to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === 465,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      text
    });
  } catch (err) {
    console.warn('Error sending email', err);
  }
};

export default sendEmail;
