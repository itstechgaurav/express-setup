let {User} = require("./../models/user");
let fs = require("fs");

class Methods {
     do(req, res, next) {
          res.view = function(name, data = {}) {
               let flash = req.flash();
               let ops = {
                    ...data,
                    flash,
               }
               if(!req.session || !req.session.token) {
                    ops.admin = false,
                    ops.guest = true
                    ops.user = "guest"
                    res.render(name, {
                         ...ops
                    });
               } else {
                    ops.admin = true,
                    ops.guest = false
                    User.findByToken(req.session.token).then(user => {
                         res.render(name, {
                              ...ops,
                              user
                         });
                    }).catch(err => {
                         req.flash("danger", "Error ! Unauthrized");
                         res.redirect("/");
                    });
               }
          };
          next();
     }
}

module.exports = new Methods().do;
