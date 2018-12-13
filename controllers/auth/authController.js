let _ = require("lodash");
let {User} = require("./../../models/user");
let {Reset} = require("./../../models/forgotPass");
let bcrypt = require("bcryptjs");
let MAIL = require("./../../server/email");
let jwt = require("jsonwebtoken");

class Auth {
     init(req, res) {
          res.view("auth/view",  {
               layout: "auth",
               msg: "Welcome"
          });
     }

    showLogin(req,res) {
        res.view("auth/login", {
             layout: "auth"
        });
    }

    profile(req, res) {
         res.view("auth/profile", {
             layout: "auth"
        });
    }

    login(req,res) {
        let {email, password} = req.body;
        User.findByCredentials(email, password).then(user => {
             if(user) {
                  return user.generateAuthToken().then(token => {
                       req.session.token = token;
                       req.flash("ter", "Your are loged In");
                       res.redirect("/profile");
                  });
             } else {
                  req.flash("warn", "Provided Creadentials not valid !!");
                  return res.redirect("/login");
             }

        }).catch(e => {
             req.flash("danger", "Error auth.login");
             res.redirect("/login");
        });
    }

    logout(req, res) {
        req.session.regenerate(err => {
             if(err) {
                  req.flash("danger", "Error auth.out");
                  res.redirect("/");
             } else {
                  req.flash("dark", "Logout successFully");
                  return res.redirect("/ohk");
             }
        });
    }

    showSignup(_,res) {
        res.view("auth/signup", {layout: "auth"});
    }

    signup(req,res) {
      let body = _.pick(req.body, ["name","email","password"]);
      let user = new User(body);
      let token = jwt.sign({tok: user._id}, process.env.VERIFICATION_SECRET).toString();
      let ops = {
           from: `"Admin" <${process.env.EMAIL_MAIL}>`,
           to: user.email,
           subject: "Account Verification ✔",
      };
      MAIL.view(ops, "verifySignup", {
           verificationLink: process.env.MAIN_HOST + "/verify/" + token
      }, (d) => {
           if (!d) {
               req.flash("warn", "Error during account creation");
               return res.redirect("/ohk");
           } else {
                user.save().then(() => {
                     req.flash("sec", "Account Created successFully <br> Check email to verify");
                     return res.redirect("/ohk");
                }).catch(e => {
                     req.flash("warn", "Account already exists");
                     return res.redirect("/ohk");
                });
         }
      });

    }

    verify(req, res) {
         const tok = req.params.tok;
         try {
              let decoded = jwt.verify(tok, process.env.VERIFICATION_SECRET);
              User.findOne({
                   _id: decoded.tok
              }).then(user => {
                   if(!user) {
                        req.flash("warn", "Invalid user token")
                        return res.redirect("/ohk");
                   } else if (user.verified) {
                        req.flash("ter", "User Already Verified")
                        return res.redirect("/ohk");
                   } else {
                       return user.generateAuthToken();
                   }
              }).then(token => {
                   req.session.token = token;
                   req.flash("ter", "Account Verified")
                   return res.redirect("/ohk");
              }).catch(e => {
                   req.flash("warn", "Invalid user verification")
                   return res.redirect("/ohk");
              });
         } catch (e) {
              req.flash("warn", "Invalid Verification Token")
              return res.redirect("/ohk");
         }

    }

    showReset(req, res) {
        res.view("auth/reset", {layout: "auth"})
    }

    resetPassMail(req, res) {
        User.findOne({
             email: req.body.email
        }).then(user => {
             if(!user) return Promise.reject();

             let resetPassword = new Reset({user_id: user._id});
             let token = jwt.sign({tok: user._id}, process.env.VERIFICATION_SECRET).toString();
             let ops = {
                  from: `"Admin" <${process.env.EMAIL_MAIL}>`,
                  to: user.email,
                  subject: "Password Reset ✔",
                  html: `<link href="http://localhost:1337/main.css" rel="stylesheet"><a class="text-prime" href="${process.env.MAIN_HOST + "/reset/" + token}">Reset</>`
             };

             MAIL.send(ops, (d) => {
                  if(!d) {
                      req.flash("warn", "Error: sanding reset mail")
                      return res.redirect("/ohk");
                 } else {
                      resetPassword.save().then(() => {
                           req.flash("ter", `Reset Mail sent <${req.body.email}>`);
                           return res.redirect("/ohk");
                      }).catch(e => {
                           req.flash("warn", "Error: during reset");
                           return res.redirect("/ohk");
                      })
                 }
             });

        }).catch(e => {
             req.flash("warn", "No Account Associated With This Email Address")
             return res.redirect("/ohk");
        })
    }

    resetPass(req, res) {
         try {
              let decoded = jwt.verify(req.params.token, process.env.VERIFICATION_SECRET);
              Reset.find({
                   user_id: decoded.tok
              }).then((reset) => {
                  if(!reset.length) return Promise.reject();
                  User.findOne({_id: decoded.tok}).then(user => {
                       if(!user) return Promise.reject();
                       return res.view("auth/resetPasswordForm", {layout: "auth"});
                  }).catch(e => {
                      req.flash("warn", "Account Not Found")
                      return res.redirect("/ohk");
                 });
              }).catch(e => {
                  req.flash("warn", "Reset Request Not Found")
                  return res.redirect("/ohk");
             });
         } catch (e) {
             req.flash("warn", "Account Not Found")
             return res.redirect("/ohk");
         }
    }

    resetingPass(req, res) {
         try {
              let decoded = jwt.verify(req.params.token, process.env.VERIFICATION_SECRET);
              Reset.find({
                   user_id: decoded.tok
              }).then((reset) => {
                  if(!reset.length) return Promise.reject();
                  User.findOne({_id: decoded.tok}).then(user => {
                       if(!user) return Promise.reject();
                       user.password = req.body.password;
                       user.save().then(() => {
                           Reset.deleteMany({user_id: user._id},e => {});
                           req.flash("prime", "Password Reset successFully")
                           return res.redirect("/ohk");
                       }).catch(e => {
                           req.flash("warn", "Error during new password process")
                           return res.redirect("/ohk");
                       })
                  }).catch(e => {
                      req.flash("warn", "Account Not Found")
                      return res.redirect("/ohk");
                 });
              }).catch(e => {
                  req.flash("warn", "Reset Request Not Found")
                  return res.redirect("/ohk");
             });
         } catch (e) {
             req.flash("warn", "Account Not Found")
             return res.redirect("/ohk");
         }
    }
}

module.exports = new Auth();
