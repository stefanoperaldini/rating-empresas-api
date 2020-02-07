"use strict";

const sendgridMail = require("@sendgrid/mail");
const Joi = require("@hapi/joi");

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailPassword(email, newPassword) {
  const [username] = email.split("@");

  let subject = "Rating Empresas - Password recovery";
  let text = `Dear ${username}. Your new password is: ${newPassword}.`;
  let html = `<p>Dear ${username} </p><p>Your new password is: ${newPassword}.</p>
        <p>We recommend changing your password after the first <a href="${process.env.HTTP_SERVER_FRONTEND}/account/login">Sign in</a></p>`;

  if (newPassword === null) {
    subject = "Rating Empresas - Change password";
    text = `Dear ${username}. Your password has been changed.`;
    html = `<p>Dear ${username} </p><p>Your password has been changed.</p><p><a href="${process.env.HTTP_SERVER_FRONTEND}/account/login">Sign in</a></p>`;
  }

  const msg = {
    to: email,
    from: {
      email: "noreply.ratingempresas@mail.com",
      name: "Rating Empresas"
    },
    subject: subject,
    text: text,
    html: html
  };

  const data = await sendgridMail.send(msg);

  return data;
}

async function sendEmailRegistration(email, verificationCode) {
  const linkActivacion = `${process.env.HTTP_SERVER_FRONTEND}/account/activate/${verificationCode}`;
  const [username] = email.split("@");
  const msg = {
    to: email,
    from: {
      email: "noreply.ratingempresas@yopmail.com",
      name: "Rating Empresas"
    },
    subject: "Welcome to Rating Empresas",
    text: `Dear ${username}. Thank you for registering. Please, visit this page to confirm your e-mail 
    address and activate your account: ${linkActivacion}`,
    html: `<p>Dear ${username} </p><p>Thank you for registering. Please, click on the following link to 
    confirm your e-mail address and activate your account: </p><p><a href="${linkActivacion}">Activate account</a></p>`
  };

  const data = await sendgridMail.send(msg);

  return data;
}

async function sendEmailReport(reviewId) {
  const linkReportToDelete = `${process.env.HTTP_SERVER_FRONTEND}/review/${reviewId}`;
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: {
      email: "noreply.ratingempresas@yopmail.com",
      name: "Rating Empresas"
    },
    subject: "Rating Empresas - Report review",
    text: `To delete the review, please visit the page ${linkReportToDelete}. Thank you`,
    html: `<p>To delete the review, please click on the following link</p><p><a href="${linkReportToDelete}">Delete review</a></p>
        <p>Thank you</p>`
  };

  const data = await sendgridMail.send(msg);

  return data;
}

async function validateEmail(payload) {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
  });
  Joi.assert(payload, schema);
}

module.exports = {
  sendEmailPassword,
  sendEmailRegistration,
  sendEmailReport,
  validateEmail
};
