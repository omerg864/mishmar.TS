"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.dateToStringShort = exports.addDays = void 0;
const nodemailer = require("nodemailer");
const addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const dateToStringShort = (date) => {
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    let MM = mm.toString();
    let DD = dd.toString();
    if (dd < 10)
        DD = '0' + dd;
    if (mm < 10)
        MM = '0' + mm;
    const formattedDate = DD + '.' + MM;
    return formattedDate;
};
exports.dateToStringShort = dateToStringShort;
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