let _ = require("lodash");
let {User} = require("./../../models/user");
let bcrypt = require("bcryptjs");

class Auth {

     init(req, res) {
          res.render("auth/view",  {
               layout: "auth",
               msg: "Welcome",
               loged: req.session.token ? true : false
          });
     }

    showLogin(req,res) {
        res.render("auth/login", {
             layout: "auth"
        });
    }

    profile(req, res) {
         User.findByToken(req.session.token).then(user => {
              res.jsonp(user);
         }).catch(e => {
              res.send("Connect Failed");
         });
    }

    login(req,res) {
        let body = _.pick(req.body, ["email", "password"]);
        User.findByCredentials(body.email, body.password).then(user => {
             return user.generateAuthToken().then(token => {
                  req.session.token = token;
                  res.render("auth/view", {
                       layout: "auth",
                       msg: "Loged In Successfully !!"
                  });
             });
        }).catch(e => {
             res.status(401).send();
        });
    }

    logout(req, res) {
        req.session.destroy();
        res.render("auth/view", {
            layout: "auth",
            msg: "Loged Out Successfully !!"
        });
    }

    showSignup(_,res) {
        res.render("auth/signup", {layout: "auth"});
    }

    signup(req,res) {
      let body = _.pick(req.body, ["name","email","password"]);
      let user = new User(body);
      user.save().then(() => {
           return user.generateAuthToken();
      }).then((token) => {
           req.session.token = token;
           res.render("auth/view", {
                layout: "auth",
                msg: "Sign up Successfully !!"
           });
      }).catch(e => {
           res.status(400).send(`!!Error: ${e}`);
      });
    }

    profile(req,res) {
         res.send(req.user);
    }
}

module.exports = new Auth();
