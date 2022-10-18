"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.addDays = void 0;
const nodemailer = require("nodemailer");
const addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const sendMail = (reciever, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: reciever,
        subject,
        text
    };
    let response = {};
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            response.error = error;
        }
        else {
            response.response = info.response;
        }
    });
    return response;
};
exports.sendMail = sendMail;
//# sourceMappingURL=functions.js.map