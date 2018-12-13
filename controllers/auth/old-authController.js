let _ = require("lodash");
let {User} = require("./../../models/user");
let bcrypt = require("bcryptjs");
let MAIL = require("./../../email");

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
      user.save().then(() => {
           return user.generateAuthToken();
      }).then((token) => {
           letjwt.sign({tok: user._id + process.env.VERIFICATION_SECRET}, process.env.JWT_SECRET).toString();
           MAIL.send({
                from: `"Admin" <${process.env.EMAIL_MAIL}>`,
                to: user.email,
                subject: "Account Verification ✔",
                html: `<a href="${process.env.MAIN_HOST + "/verify?token=" + token}">Verify</>`
           })
           req.session.token = token;
           req.flash("sec", "Accound Created successFully");
           req.flash("sec", "Check email to verify");
           res.redirect("/");
      }).catch(e => {
           res.status(400).send(`!!Error: ${e}`);
      });
    }

    verify() {

    }
}

module.exports = new Auth();
