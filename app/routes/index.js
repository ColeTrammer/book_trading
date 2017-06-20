"use strict";

const mw = require("../middlewares");
const books = require("../controllers/books.js");
const User = require("../models/users.js");
const Book = require("../models/books.js");
const async = require("async");

module.exports = (app, passport) => {

    app.get("/books", books.all);

    app.get("/books/new", mw.redirectTo, mw.forceLogIn, books.showNew);
    app.post("/books/new", mw.redirectTo, mw.forceLogIn, mw.parseForm, books.new);

    app.get("/books/:index/trade", mw.redirectTo, mw.forceLogIn, books.showTrade);
    app.post("/books/:index/trade", mw.redirectTo, mw.forceLogIn, mw.parseForm, books.trade);

    app.get("/books/:index/trade_accept", mw.redirectTo, mw.forceLogIn, books.acceptTrade);

    app.get("/books/:index", books.show);

    app.get("/dashboard", mw.forceLogIn, (req, res) => {
        async.eachSeries(req.user.trades, (trade, done) => {
            async.parallel([
                (cb) => {
                    Book.findOne({_id: trade.proposed}, (err, book) => {
                        trade.proposed = book;
                        User.findOne({_id: trade.proposed.owner}, (err, user) => {
                            trade.proposedOwner = user;
                            cb();
                        });
                    });
                },
                (cb) => {
                    Book.findOne({_id: trade.requested}, (err, book) => {
                        trade.requested = book;
                        User.findOne({_id: trade.requested.owner}, (err, user) => {
                            trade.requestedOwner = user;
                            cb();
                        });
                    });
                }
            ], done);
        }, () => {
            res.render("dashboard", {trades: req.user.trades});
        });
    });

    app.get("/dashboard/update", mw.redirectTo, mw.forceLogIn, (req, res) => {
        res.render("update_user");
    });
    app.post("/dashboard/update", mw.redirectTo, mw.forceLogIn, mw.parseForm, (req, res) => {
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
