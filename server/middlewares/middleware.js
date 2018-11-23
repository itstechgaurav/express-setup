module.exports = function(name) {
     name = name.split("@");
     let control = require("./" + name[0] + "Middleware");
     return control[name[1]];
};
