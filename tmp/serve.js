const fs = require("fs");
const path = require("path");

const {render} = require("./rendrer");

let init = function (app, route = "routes.json") {
    route = path.join(__dirname, route);
    let content = require(route);
    content.init.forEach(function (it) {
        app.get(it.path, (req, res) => {
            let rendred = render(it.view, it.data);
            res.send(rendred);
        });
//        app.get(it.path, (req, res) => {
//            console.log(it.path);
//            res.send(it.res);
//        });
    })
}

module.exports = {
    init
}
