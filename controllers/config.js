module.exports = function(name) {
     name = name.split("@");
     let control = require("./" + name[0] + "Controller");
     return control[name[1]];
};
