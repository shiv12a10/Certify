const nodemailer = require("nodemailer");
const { SMTP_USER, SMTP_PASS ,  SMTP_HOST,
  SMTP_PORT } = require("../configs");
module.exports = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, // true for 465, false for other ports
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});
