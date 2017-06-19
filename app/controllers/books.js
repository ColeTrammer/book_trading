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
                let index = 0;
                for (let i = 0; i < books.length; i++) {
                    index = Math.max(index, books[i].index);
                }
                req.body.index = index + 1;
                Book.create(req.body, () => {
                    res.redirect("/books");
                });
            });
        else
            res.redirect("/books");
    },
    show: (req, res) => {
        Book.findOne({index: req.params.index}, (err, book) => {
            if (book)
                res.render("books/show", {book: book});
            else
                res.redirect("/books");
        });
    },
    showNew: (req, res) => {
        res.render("books/new");
    }
};
