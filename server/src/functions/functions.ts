import * as nodemailer from "nodemailer";

export const addDays = (date: Date, days: number): Date => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export const dateToStringShort = (date: Date): string => {
  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();

  let MM = mm.toString();
  let DD = dd.toString();

  if (dd < 10) 
      DD = '0' + dd;
  if (mm < 10) 
      MM = '0' + mm;

  const formattedDate = DD + '.' + MM;
  return formattedDate;
}

export const DateTimeToString = (date: Date): string => {
  let mm = date.getMinutes();
  let hh = date.getHours();

  let MM = mm.toString();
  let HH = hh.toString();

  if (hh < 10) 
      HH = '0' + hh;
  if (mm < 10) 
      MM = '0' + mm;

  const formattedTime = HH + ':' + MM;
  return formattedTime;
}

export const dateToString = (date: Date): string => {
  const yyyy = date.getFullYear() % 100;
  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();

  let MM = mm.toString();
  let DD = dd.toString();

  if (dd < 10) DD = '0' + dd;
  if (mm < 10) MM = '0' + mm;

  const formattedDate = DD + '/' + MM + '/' + yyyy;
  return formattedDate;
}

export const numberToDay = (num: number): string => {
  const days_names = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  return days_names[num];
}

export const sendMail = (receiver: string|string[], subject: string, text: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: receiver,
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