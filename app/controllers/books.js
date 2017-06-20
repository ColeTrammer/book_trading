"use strict";

const Book = require("../models/books.js");
const User = require("../models/users.js");

module.exports = {
    all: (req, res) => {
        Book.find({}, (err, books) => {
            res.render("books", {books: books});
        });
    },
    new: (req, res) => {
        if (req.body && req.body.title && req.body.description)
            Book.find({}, (err, books) => {
                req.body.index = 0;
                for (let i = 0; i < books.length; i++) {
                    req.body.index = Math.max(req.body.index, books[i].index) + 1;
                }
                req.body.owner = req.user._id;
                req.body.trading = false;
                Book.create(req.body, () => {
                    res.redirect("/books");
                });
            });
        else
            res.redirect("/books");
    },
    trade: (req, res) => {
        if (req.body && req.body.book) {
            Book.findOne({index: req.params.index}, (err, requestedBook) => {
                Book.findOne({owner: req.user._id, title: req.body.book}, (err, proposedBook) => {
                    if (/*requestedBook.owner.equals(req.user._id) || */requestedBook === proposedBook || requestedBook.trading || proposedBook.trading) {
                        req.flash("errorMessages", "Invalid trade");
                        return res.redirect("/books");
                    } else {
                        let trade = {
                            requested: requestedBook._id,
                            proposed: proposedBook._id,
                            type: "sent",
                            status: "pending"
                        };
                        User.findOne({_id: req.user._id}, (err, proposingUser) => {
                            proposingUser.trades.push(trade);
                            proposingUser.save((err) => {
                                req.flash("successMessages", "trade sent");
                                res.redirect("/dashboard");
                            });
                            User.findOne({_id: requestedBook.owner}, (err, requestedUser) => {
                                trade.type = "recieving";
                                requestedUser.trades.push(trade);
                                requestedUser.save();
                            });
                        });
                        requestedBook.trading = true;
                        requestedBook.save();
                        proposedBook.trading = true;
                        proposedBook.save();
                    }
                });
            });
        } else {
            res.redirect("/books");
        }
    },
    show: (req, res) => {
        Book.findOne({index: req.params.index}, (err, book) => {
            if (book)
                res.render("books/show", {book: book});
            else
                res.redirect("/books");
        });
    },
    acceptTrade: (req, res) => {
        Book.findOne({index: req.params.index}, (err, book) => {
            if (err || !book) return res.redirect("/books");
            let trade;
            for (let i = 0; i < req.user.trades.length; i++) {
                if (req.user.trades[i].requested.equals(book._id) && req.user.trades[i].type === "recieving") {
                    trade = req.user.trades[i];
                    break;
                }
            }
            if (trade) {
                Book.findOne({_id: trade.proposed}, (err, proposed) => {
                    User.findOne({_id: proposed.owner}, (err, user) => {
                        let trade_;//have two copies of trade for each user. too lazy to make it its own model
                        for (let i = 0; i < user.trades.length; i++) {
                            if (user.trades[i].proposed.equals(proposed._id) && user.trades[i].type === "sent") {
                                trade_ = user.trades[i];
                                break;
                            }
                        }
                        if (trade_) {
                            trade.status = "accepted";
                            trade_.status = "accepted";
                            console.log(user);
                            console.log(req.user);
                            user.markModified("trades");
                            user.save(() => {
                                req.user.markModified("trades");
                                req.user.save(() => {
                                    req.flash("successMessages", "Trade accepted");
                                    res.redirect("/dashboard");
                                });
                            });
                        } else {
                            return res.redirect("/books");
                        }
                    });
                });
            } else {
                return res.redirect("/books");
            }
        });
    },
    showNew: (req, res) => {
        res.render("books/new");
    },
    showTrade: (req, res) => {
        if (req.user.state && req.user.city && req.user.fullName)
            Book.find({owner: req.user._id}, (err, books) => {
                let tradable = false;
                for (let i = 0; i < books.length; i++) {
                    if (books[i].index === +req.params.index) {
                        //req.flash("errorMessages", "You can't trade a book with yourself.");
                        //return res.redirect(`/books/${req.params.index}`);
                    }
                    if (!books[i].trading)
                        tradable = true;
                }
                if (tradable)
                    res.render("books/trade", {books: books});
                else {
                    req.flash("errorMessages", "You can't trade because you have no books not already traded");
                    res.redirect(`/books/${req.params.index}`);
                }
            });
        else {
            req.flash("errorMessages", "You must fill out more of your info")
            res.redirect("/dashboard");
        }
    }
};
