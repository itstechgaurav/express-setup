const fs = require("fs");
const path = require("path");

const config = {
    title: "Hello world",
    logoText: "SPYDER",
    head() {
        return require("./rendrer").render("header", {
            title: "hello Title"
        }, false);
    }
};

let render = function (n, d = {}, op = true) {
    if (op) {
        Object.keys(config).forEach(it => {
            if(typeof config[it] == "function") {
                d[it] = config[it]();
            } else {
                d[it] = config[it];
            }
        });
    }
    let filePath = path.join(__dirname, "../views", n.replace(".html", "") + ".html");
    let contents = fs.readFileSync(filePath, "utf-8");
    Object.keys(d).forEach(function (k) {
        contents = contents.replace(`{{${k}}}`, d[k]);
    });
    return contents;
}

module.exports = {
    render
}
