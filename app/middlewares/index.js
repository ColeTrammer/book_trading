"use strict";

const bodyParser = require("body-parser");

module.exports = {
    forceLogIn: (req, res, next) => {
        if (req.isAuthenticated()) return next();
        else res.redirect("/login");
    },
    parseForm: bodyParser.urlencoded({extended: false}),
    redirectTo: (path) => (req, res, next) => {
        req.flash("redirect", path);
        next();
    }
}
