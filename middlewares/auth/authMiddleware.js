let {User} = MODEL("user");

class authMiddleware {
    do(req, res, next) {
         if(req.session && req.session.token === false) {
             req.flash("danger", "Error ! Unauthrized");
             res.redirect("/");
         }
         User.findByToken(req.session.token).then(user => {
            if(!user) {
                 return Promise.reject();
            }
            next();
        }).catch(e => {
            req.flash("danger", "Error ! Unauthrized");
            res.redirect("/");
        });
    }

    loged(req, res, next) {
         if(req.session && req.session.token) {
              req.flash("warn", "Already Loged In");
              return res.redirect("/");
         }
         next();
    }

    logedout(req, res, next) {
         if(!req.session || !req.session.token) {
              req.flash("warn", "Need to Log In First");
              return res.redirect("/");
         }
         next();
    }
}

module.exports = new authMiddleware();
