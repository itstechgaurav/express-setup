const path = require('path');

global.RQ = function(name) {
     return require(path.join(appRoot, name));
}

let RT = function(app) {
     return require("./router")(app);
}

let CN = function(name) {
     name = name.split("@");
     let control = RQ("/controllers/" + name[0] + "Controller");
     return control[name[1]];
}

let MD = function(name) {
     name = name.split("@");
     let control = RQ("/middlewares/" + name[0] + "Middleware");
     if(name.length == 2)
          return control[name[1]];
     return control;
}

let MODEL = function(name) {
     return RQ("/models/" + name);
}

let MAIL = function(name) {
     return RQ("/controllers/Mail/" + name + "Mail");
}

module.exports = function(app) {
     return {
          RT: (RT)(app),
          CN,
          MD,
          MODEL,
          MAILER: RQ("/server/mailer"),
          MAIL
     }
}
