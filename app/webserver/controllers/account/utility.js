"user strict"

const sendgridMail = require("@sendgrid/mail");
const Joi = require("@hapi/joi");

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailPassword(email, newPassword) {
    const [username] = email.split("@");
    let subject = 'Rating Empresas - Password recovery';
    let text = `Dear ${username}. The new password is: ${newPassword}.`;
    let html = `<p>Dear ${username}</p><p>The new password is: ${newPassword}.</p>
        <p>We recommend changing your password after the first login to ${process.env.HTTP_SERVER_DOMAIN}</p>`;

    if (newPassword === null) {
        subject = 'Rating Empresas - Change password';
        text = `Dear ${username}. The password has been changed.`;
        html = `<p>Dear ${username}</p><p>The password has been changed.</p><p>${process.env.HTTP_SERVER_DOMAIN}</p>`;
    }


    const msg = {
        to: email,
        from: {
            email: 'noreply.ratingempresas@mail.com',
            name: 'Rating Empresas',
        },
        subject: subject,
        text: text,
        html: html,
    };

    const data = await sendgridMail.send(msg);

    return data;
}

async function sendEmailRegistration(email, verificationCode) {
    const linkActivacion = `${process.env.HTTP_SERVER_DOMAIN}/v1/accounts/activate?verification_code=${verificationCode}`;
    const [username] = email.split("@");
    const msg = {
        to: email,
        from: {
            email: 'noreply.ratingempresas@mail.com',
            name: 'Rating Empresas',
        },
        subject: 'Welcome to Hack a Boss Rating Empresas',
        text: `Dear ${username}. Thank you for registering. To activate your account, please click on the folowing link 
        (this will confirm your email address): ${linkActivacion}. Thank You`,
        html: `<p>Dear ${username}</p><p>Thank you for registering. To activate your account, please click on the folowing link 
        (this will confirm your email address):</p><p><a href="${linkActivacion}">${linkActivacion}</a></p>
        <p>Thank You</p>`,
    };

    const data = await sendgridMail.send(msg);

    return data;
}

async function validateEmail(payload) {
    const schema = Joi.object({
        email: Joi
            .string()
            .email()
            .required(),
    });
    Joi.assert(payload, schema);
}

module.exports = {
    sendEmailPassword,
    sendEmailRegistration,
    validateEmail,
};