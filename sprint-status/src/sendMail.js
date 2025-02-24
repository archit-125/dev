const nodemailer = require("nodemailer");
const { EMAIL } = require("./constants");

function sendMailDriver(mailBody) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: process.env.GOOGLE_APP_PWD,
    },
  });

  const mailOptions = {
    from: EMAIL,
    to: EMAIL,
    subject: "GSD Block Status Update",
    html: mailBody, // For HTML
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error occurred:", error);
    }
    console.log("Email sent successfully:", info.response);
  });
}

module.exports = {
  sendMailDriver,
};
