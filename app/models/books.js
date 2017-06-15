"use strict";

const mongoose = require("mongoose");

const Book = new mongoose.Schema({
    name: String,
    description: String,
    cover: String
});

module.exports = mongoose.model("Book", Book);
