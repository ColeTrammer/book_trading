"use strict";

const mongoose = require("mongoose");

const Book = new mongoose.Schema({
    title: String,
    description: String,
    cover: String,
    index: Number
});

module.exports = mongoose.model("Book", Book);
