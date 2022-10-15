import * as nodemailer from "nodemailer";

export const addDays = (date: Date, days: number): Date => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export const sendMail = (reciever: string, subject: string, text: string) => {
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
    let response: {error?: Error, response?: string} = {};
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          response.error = error;
        } else {
          response.response =  info.response;
        }
    });
    return response;
}