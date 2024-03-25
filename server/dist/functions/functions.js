"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.getRandomIndex = exports.compareTwoArrays = exports.stringInArray = exports.numberToDay = exports.dateToString = exports.DateTimeToString = exports.dateToStringShort = exports.addHours = exports.addDays = void 0;
const nodemailer = __importStar(require("nodemailer"));
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const addHours = (date, hours) => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
};
exports.addHours = addHours;
const dateToStringShort = (date) => {
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
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
const DateTimeToString = (date) => {
    const mm = date.getMinutes();
    const hh = date.getHours();
    let MM = mm.toString();
    let HH = hh.toString();
    if (hh < 10)
        HH = '0' + hh;
    if (mm < 10)
        MM = '0' + mm;
    const formattedTime = HH + ':' + MM;
    return formattedTime;
};
exports.DateTimeToString = DateTimeToString;
const dateToString = (date) => {
    const yyyy = date.getFullYear() % 100;
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    let MM = mm.toString();
    let DD = dd.toString();
    if (dd < 10)
        DD = '0' + dd;
    if (mm < 10)
        MM = '0' + mm;
    const formattedDate = DD + '/' + MM + '/' + yyyy;
    return formattedDate;
};
exports.dateToString = dateToString;
const numberToDay = (num) => {
    const days_names = [
        'ראשון',
        'שני',
        'שלישי',
        'רביעי',
        'חמישי',
        'שישי',
        'שבת',
    ];
    return days_names[num];
};
exports.numberToDay = numberToDay;
const stringInArray = (name, array) => {
    return array.filter((item) => item === name).length > 0;
};
exports.stringInArray = stringInArray;
const compareTwoArrays = (arr1, arr2) => {
    const names = [];
    for (let i = 0; i < arr1.length; i++) {
        if (!arr2.every((x) => x !== arr1[i])) {
            names.push(arr1[i]);
        }
    }
    return names;
};
exports.compareTwoArrays = compareTwoArrays;
const getRandomIndex = (arrayLength) => {
    return Math.floor(Math.random() * arrayLength);
};
exports.getRandomIndex = getRandomIndex;
const sendMail = (receiver, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: receiver,
        subject,
        text,
    };
    const response = {};
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            response.error = error;
        }
        else {
            response.response = info.response;
        }
    });
    console.log(response);
    return response;
};
exports.sendMail = sendMail;
//# sourceMappingURL=functions.js.map