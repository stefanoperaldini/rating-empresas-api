"use strict";

const sendgridMail = require("@sendgrid/mail");
const Joi = require("@hapi/joi");

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailPassword(email, newPassword) {
  const [username] = email.split("@");

  let subject = "WORKPLACE - Password recovery";
  let text = `Dear ${username}. Your new password is: ${newPassword}.`;
  let html = `<div style="background-color: #f8f8f8">
                <table margin-right="5px" margin-left="5px" cellpadding="0" cellspacing="0"
                  style="margin: 0 auto; font-family: sans-serif;font-size: 16px; color: black">
                  <thead>
                    <tr>
                      <th style="text-align: center; padding-top: 25px"></th>
                    </tr>
                  </thead>
                  <tbody style="background-color: #ffff;">
                    <tr>
                      <td style="text-align: left; padding: 35px 30px 15px 30px">Dear ${username},</tdstyle>
                    </tr>
                    <tr>
                      <td style="text-align: left; padding: 10px 30px 10px 30px">Your new password is: ${newPassword}.</td>
                    </tr>
                    <tr>
                      <td style="text-align: left; padding: 5px 30px 10px 30px">We recommend changing your password after the first</td>
                    </tr>
                    <tr>
                      <td className=" link" style="text-align: center; padding-top: 10px; padding-bottom: 30px">
                        <a style="text-decoration: none; font-size: 20px" href="${process.env.HTTP_SERVER_FRONTEND}/account/login">Sign in</a></td>
                    </tr>
                  </tbody>
                  <tfoot className=" footer" style="background-color:#f8f8f8; font-size: 14px">
                    <tr>
                      <td style="text-align: center; padding: 25px 20px 35px 20px">Please, do not reply to this e-mail.</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
`;

  if (newPassword === null) {
    subject = "WORKPLACE - Change password";
    text = `Dear ${username}. Your password has been changed.`;
    html = `<div style="background-color: #f8f8f8">
              <table margin-right="5px" margin-left="5px" cellpadding="0" cellspacing="0"
                  style="margin: 0 auto; font-family: sans-serif;font-size: 16px; color: black">
                <thead>
                  <tr>
                    <th style="text-align: center; padding-top: 25px"></th>
                  </tr>
                </thead>
                <tbody style="background-color: #ffff;">
                  <tr>
                    <td style="text-align: left; padding: 35px 30px 15px 30px">Dear ${username},</tdstyle>
                  </tr>
                  <tr>
                    <td style="text-align: left; padding: 10px 30px 10px 30px">Your password has been changed.</td>
                  </tr>
                      <tr>
                    <td className=" link" style="text-align: center; padding-top: 10px; padding-bottom: 30px">
                      <a style="text-decoration: none; font-size: 20px" href="${process.env.HTTP_SERVER_FRONTEND}/account/login">Sign in</a></td>
                  </tr>
                </tbody>
                <tfoot className=" footer" style="background-color:#f8f8f8; font-size: 14px">
                  <tr>
                    <td style="text-align: center; padding: 25px 20px 35px 20px">Please, do not reply to this e-mail.</td>
                  </tr>
                </tfoot>
              </table>
            </div>`;
  }

  const msg = {
    to: email,
    from: {
      email: "noreply.workplace@mail.com",
      name: "Workplace"
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
      email: "noreply.workplace@yopmail.com",
      name: "Workplace"
    },
    subject: "Welcome to WORKPLACE",
    text: `Dear ${username}. Thank you for registering. Activate your account and let’s get started! ${linkActivacion}`,
    html: `<div style="background-color: #f8f8f8">
            <table margin-right="5px" margin-left="5px" cellpadding="0" cellspacing="0"
            style="margin: 0 auto; font-family: sans-serif;font-size: 16px; color: black">
                <thead>
                  <tr>
                    <th style="text-align: center; padding-top: 25px"></th>
                  </tr>
                </thead>
                <tbody style="background-color: #ffff;">
                  <tr>
                    <td style="text-align: left; padding: 35px 30px 15px 30px">Dear ${username},</tdstyle>
                  </tr>
                  <tr>
                    <td style="text-align: left; padding: 10px 30px 10px 30px">Thank you for registering.</td>
                  </tr>
                  <tr>
                    <td style="text-align: left; padding: 5px 30px 10px 30px">Activate your account and let’s get started!</td>
                  </tr>
                  <tr>
                    <td className=" link" style="text-align: center; padding-top: 10px; padding-bottom: 30px">
                      <a style="text-decoration: none; font-size: 20px" href="${linkActivacion}">Activate account</a></td>
                  </tr>
                </tbody>
                <tfoot className=" footer" style="background-color:#f8f8f8; font-size: 14px">
                  <tr>
                    <td style="text-align: center; padding: 25px 20px 35px 20px">Please, do not reply to this e-mail.</td>
                  </tr>
                </tfoot>
            </table>
          </div>`
  };

  const data = await sendgridMail.send(msg);

  return data;
}

async function sendEmailReport(reviewId) {
  const linkReportToDelete = `${process.env.HTTP_SERVER_FRONTEND}/review/report/${reviewId}`;
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: {
      email: "noreply.workplace@yopmail.com",
      name: "Workplace"
    },
    subject: "WORKPLACE - Report review",
    text: `To delete the review, please visit the page ${linkReportToDelete}. Thank you.`,
    html: `<div style="background-color: #f8f8f8">
              <table
                margin-right="5px"
                margin-left="5px"
                cellpadding="0"
                cellspacing="0"
                style="margin: 0 auto; font-family: sans-serif;font-size: 16px; color: black">
                <thead>
                  <tr>
                    <th style="text-align: center; padding-top: 25px"></th>
                  </tr>
                </thead>
                <tbody style="background-color: #ffff;">
                  <tr>
                    <td style="text-align: left; padding: 35px 30px 10px 30px">
                      To delete the review, click on the following link:
                    </td>
                  </tr>
                  <tr>
                    <td className=" link"
                      style="text-align: center; padding-top: 10px; padding-bottom: 10px">
                      <a style="text-decoration: none; font-size: 20px"
                        href="${linkReportToDelete}">Delete review</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align: left; padding: 5px 30px 20px 35px">
                      Thank you.
                    </td>
                  </tr>
                </tbody>
                <tfoot className=" footer"
                  style="background-color:#f8f8f8; font-size: 14px">
                  <tr>
                    <td style="text-align: center; padding: 25px 20px 35px 20px">
                      Please, do not reply to this e-mail.
                    </td>
                  </tr>
                </tfoot>
              </table>
          </div>`
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
