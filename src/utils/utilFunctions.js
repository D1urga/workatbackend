import nodemailer from "nodemailer";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  auth: {
    user: "anupchaudhary1021@gmail.com",
    pass: "jesw coqs hmzt tllh",
  },
});

export { generateOTP, transporter };
