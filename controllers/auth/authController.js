let _ = require("lodash");
let {User} = MODEL("user");
let {Reset} = MODEL("forgotPass");
let bcrypt = require("bcryptjs");
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
                  return user.generateAuthToken();
             } else {
                  return Promise.reject();
             }
        }).then(token => {
             req.session.token = token;
             req.flash("ter", "Your are loged In");
             return res.redirect("/profile");
        }).catch(e => {
             req.flash("danger", "Error auth.login");
             return res.redirect("/login");
        });
    }

    logout(req, res) {
        User.findOne({
             verified: true,
             'tokens.token': req.session.token,
             'tokens.access': 'auth'
        }).then(users => {
           let tokens = [];
           users.tokens.forEach(token => {
                if(req.session.token !== token.token) {
                     tokens.push(token);
                }
           });
           users.tokens = tokens;
           users.save().then(() => {
                req.session.regenerate(err => {
                     if(err) {
                          req.flash("danger", "Error auth.out");
                          return res.redirect("/");
                     } else {
                          req.flash("dark", "Logout successFully");
                          return res.redirect("/ohk");
                     }
                });
           });
        });

    }

    showSignup(_,res) {
        res.view("auth/signup", {layout: "auth"});
    }

    signup(req,res) {
      let body = _.pick(req.body, ["name","email","password"]);
      User.findOne({
           verified: false,
           email: body.email
      }).then(isUser => {
           if(isUser) {
                MAIL("auth").signup(isUser);
                req.flash("sec", "Account Created successFully <br> Check email to verify");
                return res.redirect("/ohk");
           } else {
                let user = new User(body);
                let token = jwt.sign({tok: user._id}, process.env.VERIFICATION_SECRET).toString();
                user.save().then(() => {
                     MAIL("auth").signup(user);
                     req.flash("sec", "Account Created successFully <br> Check email to verify");
                     return res.redirect("/ohk");
                }).catch(e => {
                     console.log(e);
                     req.flash("warn", "Account already exists");
                     return res.redirect("/ohk");
                });
           }
      }).catch(e => {
           console.log(e);
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
             resetPassword.save().then(() => {
                 MAIL("auth").forgotPassword(user);
                 req.flash("ter", `Reset Mail sent <${req.body.email}>`);
                 return res.redirect("/ohk");
             }).catch(e => {
                  req.flash("warn", "Error: during reset");
                  return res.redirect("/ohk");
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
