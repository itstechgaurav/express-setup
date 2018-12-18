class Router {
     constructor(app) {
          this.app = app;
     }

     get(path, controller, MDL = "") {
          let app = this.app;
          app.get(path, MDL === "" ? this.DMD : MD(MDL), CN(controller));
     }

     post(path, controller, MDL = "") {
          let app = this.app;
          app.post(path, MDL === "" ? this.DMD : MD(MDL), CN(controller));
     }

     DMD(req, res, next) {
          next();
     }
}

module.exports = function(app) {
     return new Router(app);
};
