const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const routes = require("./app/routes");
const passport = require("passport");
const session = require("express-session");
const sass = require("express-compile-sass");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
if (process.env.NODE_ENV !== "production")
    require("dotenv").load();
require("./app/config/passport")(passport);

const app = express();

mongoose.connect(process.env.MONGO_URI);

app.set("views", path.join(__dirname, "app/views"));
app.set("view engine", "pug");
app.set("port", process.env.PORT);
app.locals.APP_URL = process.env.APP_URL;

app.use(sass({
    root: __dirname,
    sourceMap: true,
    sourceComments: true,
    watchFiles: true,
    logToConsole: false
}));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(session({
    secret: "secret.yaml",
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.successMessages = req.flash("successMessages");
    res.locals.errorMessages = req.flash("errorMessages");
    res.locals.user = req.user;
    next();
});

routes(app, passport);

app.listen(app.get("port"));
