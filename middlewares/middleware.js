module.exports = function(name) {
     name = name.split("@");
     let control = require("./" + name[0] + "Middleware");
     if(name.length == 2)
          return control[name[1]];
     return control;
};
