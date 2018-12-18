module.exports = function(app) {
     var path = require('path');
     global.appRoot = path.join(__dirname, "..");
     const {RT, CN, MD, MODEL, MAILER, MAIL} = require('./core')(app);
     global.RT = RT;
     global.CN = CN;
     global.MD = MD;
     global.MODEL = MODEL;
     global.MAILER = MAILER;
     global.MAIL = MAIL;
}
