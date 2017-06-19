"use strict";

const mw = require("../middlewares");
const books = require("../controllers/books.js");
const User = require("../models/users.js")

module.exports = (app, passport) => {

    app.get("/books", books.all);

    app.get("/books/new", mw.redirectTo("/books/new"), mw.forceLogIn, books.showNew);
    app.post("/books/new", mw.redirectTo("/books/new"), mw.forceLogIn, mw.parseForm, books.new);

    app.get("/books/:index", books.show);

    app.get("/dashboard", mw.forceLogIn, (req, res) => {
        res.render("dashboard");
    });

    app.get("/dashboard/update", mw.redirectTo("/dashboard/update"), mw.forceLogIn, (req, res) => {
        res.render("update_user");
    });
    app.post("/dashboard/update", mw.redirectTo("/dashboard/update"), mw.forceLogIn, mw.parseForm, (req, res) => {
        if (req.body && req.user && req.body.state && req.body.city && req.body.fullName)
            User.findOneAndUpdate({_id: req.user._id}, req.body, (err) => {
                res.redirect("/dashboard");
            });
        else
            res.redirect("/dashboard");
    });

    app.get("/login", (req, res) => {
        res.redirect("/auth/twitter");
    });

    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/books");
    });

    app.get("/auth/twitter", passport.authenticate("twitter"));

    app.get("/auth/twitter/callback", (req, res, next) => {
        passport.authenticate("twitter",
            (err, user) => {
                if (err) res.redirect("/books");
                req.logIn(user, (err) => {
                    if (err) res.redirect("/books");
                    const redirect = req.flash("redirect");
                    if (redirect[0])
                        res.redirect(redirect[0]);
                    else
                        res.redirect("/dashboard");
                });
            }
        )(req, res, next);
    });

    app.get("*", (req, res) => {
        res.redirect("/books");
    });

};
