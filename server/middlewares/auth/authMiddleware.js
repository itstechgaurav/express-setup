let {User} = require("./../../models/user");

class authMiddleware {
    do(req, res, next) {
         if(req.session.token === false) {
              res.status(401).jsonp({
                  msg: "Access Rejected By AI(Mickey)"
             });
         }
         User.findByToken(req.session.token).then(user => {
            if(!user) {
                 return Promise.reject();
            }
            req.user = user;
            next();
        }).catch(e => {
            res.status(401).jsonp({
                 msg: "Access Rejected By AI(Mickey)"
            });
        });
    }

    loged(req, res, next) {
         if(req.session.token) {
              return res.render("auth/view", {
                   layout: "auth",
                   msg: "First Log Out Then Come Back !!"
              });
         }
         next();
    }

    logedout(req, res, next) {
         if(!req.session.token) {
              return res.render("auth/view", {
                   layout: "auth",
                   msg: "You Already Loged Out"
              });
         }
         next();
    }
}

module.exports = new authMiddleware();
