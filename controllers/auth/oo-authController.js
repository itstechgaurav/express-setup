let _ = require("lodash");
let {User} = require("./../../models/user");
let {Reset} = require("./../../models/forgotPass");
let bcrypt = require("bcryptjs");
let MAIL = require("./../../email");
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
                       res.redirect("/");
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
                  console.log("Success");
                  req.flash("dark", "Logout successFully");
                  res.redirect("/");
             }
        });
    }

    showSignup(_,res) {
        res.view("auth/signup", {layout: "auth"});
    }

    signup(req,res) {
      let body = _.pick(req.body, ["email","password"]);
      let user = new User(body);
      let token = jwt.sign({tok: user._id}, process.env.VERIFICATION_SECRET).toString();
      let ops = {
           from: `"Admin" <${process.env.EMAIL_MAIL}>`,
           to: user.email,
           subject: "Account Verification ✔",
           html: `<a href="${process.env.MAIN_HOST + "/verify/" + token}">Verify</>`
      };
      MAIL.sendMail(ops, (err, info) => {
           if (err) {
               console.log("inside if");
               req.flash("warn", "Error during account creation");
               return res.redirect("/");
           } else {
                user.save().then(() => {
                     req.flash("sec", "Account Created successFully <br> Check email to verify");
                     return res.redirect("/");
                }).catch(e => {
                     return res.status(400).send(`!!Error: ${e}`);
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
                        return res.redirect("/");
                   } else if (user.verified) {
                        req.flash("ter", "User Already Verified")
                        return res.redirect("/");
                   } else {
                       return user.generateAuthToken();
                   }
              }).then(token => {
                   req.session.token = token;
                   req.flash("ter", "Account Verified")
                   return res.redirect("/");
              }).catch(e => {
                   req.flash("warn", "Invalid user verification")
                   return res.redirect("/");
              });
         } catch (e) {
              req.flash("warn", "Invalid Verification Token")
              return res.redirect("/");
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

             MAIL.sendMail(ops, (err, info) => {
                  if(err) {
                      req.flash("warn", "Error: sanding reset mail")
                      return res.redirect("/");
                 } else {
                      resetPassword.save().then(() => {
                           req.flash("ter", `Reset Mail sent <${req.body.email}>`);
                           return res.redirect("/");
                      }).catch(e => {
                           req.flash("warn", "Error: during reset");
                           return res.redirect("/");
                      })
                 }
             });

        }).catch(e => {
             req.flash("warn", "No Account Associated With This Email Address")
             return res.redirect("/");
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
                      return res.redirect("/");
                 });
              }).catch(e => {
                  req.flash("warn", "Reset Request Not Found")
                  return res.redirect("/");
             });
         } catch (e) {
             req.flash("warn", "Account Not Found")
             return res.redirect("/");
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
                           return res.redirect("/");
                       }).catch(e => {
                           req.flash("warn", "Error during new password process")
                           return res.redirect("/");
                       })
                  }).catch(e => {
                      req.flash("warn", "Account Not Found")
                      return res.redirect("/");
                 });
              }).catch(e => {
                  req.flash("warn", "Reset Request Not Found")
                  return res.redirect("/");
             });
         } catch (e) {
             req.flash("warn", "Account Not Found")
             return res.redirect("/");
         }
    }
}

module.exports = new Auth();
