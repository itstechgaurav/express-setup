'use strict';
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const hbs = require('handlebars');
var inLineCss = require('nodemailer-juice');
const email = {
     mail: process.env.EMAIL_MAIL,
     user: process.env.EMAIL_USERNAME,
     pass: process.env.EMAIL_PASS,
     port: process.env.EMAIL_PORT,
     host: process.env.EMAIL_HOST

}

let transporter = nodemailer.createTransport({
    host: email.host,
    port: email.port,
    secure: parseInt(email.port) === 465, // true for 465, false for other ports
    auth: {
       user: email.user, // generated ethereal user
       pass: email.pass // generated ethereal password
    }
});


transporter.use('compile', inLineCss());

// setup email data with unicode symbols
let mailOptions = {
    from: `"Admin" <${email.mail}>`, // sender address
    to: 'myselfgroot@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>' // html body
};

// send mail with defined transport object



class MAIL {
     send(ops = mailOptions, callback) {
          transporter.sendMail(ops, (error, info) => {
               if(info) {
                    callback(true);
               } else {
                    callback(false);
               }
            });
     }

     view(ops, name, data, callback) {
          var source = fs.readFileSync(path.join(__dirname,"../MailTemplates/", name + ".hbs"), 'utf8');
          var template = hbs.compile(source);
          ops.html = template(data);
          transporter.sendMail(ops, (error, info) => {
              if(info) {
                   callback(true);
              } else {
                   callback(false);
              }
          });
     }

}




// module.exports = transporter;
module.exports = new MAIL();
