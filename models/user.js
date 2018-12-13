let mongoose = require("../db/db");
let validator = require("validator");
let jwt = require("jsonwebtoken");
let _ = require("lodash");
let bcrypt = require("bcryptjs");

var schema = new mongoose.Schema({
  name: {
       type: String,
       required: false,
       default: "No Name"
 },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is !!!Email`
    }
  },
  verified: {
     type: Boolean,
     default: false
 },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
       access: {
            type: String,
            required: true
       },
       token: {
            type: String,
            required: true
       }
 }]


});

schema.pre("save", function(next) {
     let user = this;
     if(user.isModified('password')) {
          bcrypt.genSalt(10, (err, salt) => {
               bcrypt.hash(user.password, salt, (err, hash) => {
                    user.password = hash;
                    console.log(user);
                    next();
               })
          });
     }else {
          next();
     }
})

schema.statics.findByToken = function(token) {
     let User = this;
     let decoded;

     try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
     } catch (e) {
          return new Promise((resolve, reject) => {
               reject(e);
          });
     }

     return User.findOne({
          _id: decoded._id,
          verified: true,
          'tokens.token': token,
          'tokens.access': 'auth'
     });
}

schema.statics.findByCredentials = function(email,password) {
     let user = this;

     return User.findOne({email, verified: true}).then(user => {
          if(!user) {
               return Promise.reject();
          }

          return new Promise(function(resolve, reject) {
               bcrypt.compare(password, user.password, (err, rss) => {
                    if(rss) {
                         resolve(user);
                    } else {
                         reject();
                    }
               })
          });
     })
}

schema.methods.toJSON = function() {
     let user = this.toObject();
     return _.pick(user, ["_id", "name", "email"])

}

schema.methods.generateAuthToken = function() {
     let user = this;
     let access = "auth";
     let token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
     user.tokens.push({
          access,
          token
     });
     user.verified = true;
     return user.save().then(() => {
          return token;
     });
}

var User = mongoose.model("User", schema);


module.exports = {User}
