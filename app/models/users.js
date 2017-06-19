"use strict";

const mongoose = require("mongoose");

const User = new mongoose.Schema({
    twitter: {
        id: String,
        displayName: String,
        username: String
    },
    fullName: String,
    city: String,
    state: String
});

module.exports = mongoose.model("User", User);
