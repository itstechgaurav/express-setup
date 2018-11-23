// Starting PUBG Mobile :) Enjoy

let crpt = require("bcryptjs");

let pass = "fsdjkfh"
let h = "$2a$10$3lDqRY28CaHCKhC7TTlG9.8fN0nsAN79fkS0YzPilAZrjLrT11LQ.";

crpt.genSalt(10, (e,s) => {
     crpt.hash(pass, s, (e, h) => {
          console.log(h);
     });
});

crpt.compare(pass, h, (e, r) => {
     console.log(r);
});
