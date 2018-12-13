function abc(callback) {
     setTimeout(function() {
          callback({
               name: "Gaurav"
          });
     },3000);
}


abc(function(data) {
     console.log(data);
});
