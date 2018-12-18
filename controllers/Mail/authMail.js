let jwt = require("jsonwebtoken");


class authMail {
     signup(user) {
          let token = jwt.sign({tok: user._id}, process.env.VERIFICATION_SECRET).toString();
          let verificationLink = process.env.MAIN_HOST + "/verify/" + token;
          let ops = {
               from: `"Admin" <${process.env.EMAIL_MAIL}>`,
               to: user.email,
               subject: "Account Verification ✔",
          };
          MAILER.template(ops, "verifySignup", {
               verificationLink
          });
     }

     forgotPassword(user) {
          let token = jwt.sign({tok: user._id}, process.env.VERIFICATION_SECRET).toString();
          let ops = {
               from: `"Admin" <${process.env.EMAIL_MAIL}>`,
               to: user.email,
               subject: "Password Reset ✔",
               html: `<link href="http://localhost:1337/main.css" rel="stylesheet"><a class="text-prime" href="${process.env.MAIN_HOST + "/reset/" + token}">Reset</>`
          };
          MAILER.send(ops);
     }
}

module.exports = new authMail();
