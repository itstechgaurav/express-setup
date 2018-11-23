const {PORT, RT,CN, MD, express, bodyParser, app} = require("./config");

// routes started

RT.get("/", "auth/auth@init");
RT.get("/profile", "auth/auth@profile", "auth/auth@do")
RT.get("/login", "auth/auth@showLogin", "auth/auth@loged");
RT.get("/logout", "auth/auth@logout", "auth/auth@logedout");
RT.post("/login", "auth/auth@login", "auth/auth@loged");
RT.get("/signup", "auth/auth@showSignup", "auth/auth@loged");
RT.post("/signup", "auth/auth@signup", "auth/auth@loged");

// route ended

app.listen(PORT, function () {
    console.log("App is running on: " + PORT);
});
