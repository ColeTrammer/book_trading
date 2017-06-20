"use strict";

const mongoose = require("mongoose");

const Book = new mongoose.Schema({
    title: String,
    description: String,
    cover: String,
    index: Number,
    owner: mongoose.Schema.Types.ObjectId,
    trading: Boolean
});

module.exports = mongoose.model("Book", Book);
