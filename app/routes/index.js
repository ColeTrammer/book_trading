"use strict";

module.exports = (app, passport) => {

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) return next();
        else res.redirect("/login");
    }

    app.get("/", (req, res) => {
        res.render("index");
    })

    app.get("/login", (req, res) => {
        res.redirect("/auth/twitter");
    });

    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/");
    });

    app.get("/auth/twitter", passport.authenticate("twitter"));

    app.get("/auth/twitter/callback", passport.authenticate("twitter", {
        successRedirect: "/",
        failureRedirect: "/"
    }));

    app.get("*", (req, res) => {
        res.redirect("/");
    });
};
