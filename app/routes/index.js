"use strict";

const bodyParser = require("body-parser");
const polls = require("../controllers/polls");

module.exports = (app, passport) => {

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) return next();
        else res.redirect("/login");
    }

    function redirectNew(req, res, next) {
        req.flash("redirect", "new");
        next();
    }

    const parseForm = bodyParser.urlencoded({
        extended: false,
    });

    app.get("/polls/new", redirectNew, isLoggedIn, polls.getNewForm);
    app.post("/polls/new", parseForm, isLoggedIn, polls.new);

    app.get("/polls", polls.index);

    app.get("/polls/:id", polls.show);
    app.post("/polls/:id", parseForm, polls.vote);

    app.get("/polls/:id/delete", polls.delete);

    app.post("/polls/:id/add_option", parseForm, isLoggedIn, polls.new_option);

    app.get("/api/polls/:id", polls.getData);

    app.get("/login", (req, res) => {
        res.redirect("/auth/github");
    });

    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/polls");
    });

    app.get("/new_user", polls.new_user);

    app.get("/auth/github", passport.authenticate("github"));

    app.get("/auth/github/callback", passport.authenticate("github", {
        successRedirect: "/new_user",
        failureRedirect: "/login"
    }));

    app.get("*", (req, res) => {
        res.redirect("/polls");
    });
};
