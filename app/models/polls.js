"use strict";

const mongoose = require("mongoose");

const Poll = new mongoose.Schema({
    title: String,
    options: [String],
    votes: [Number],
    data: Date,
    usersWhoVoted: [mongoose.Schema.Types.ObjectId],
    ipsThatVoted: [String]
});

module.exports = mongoose.model("Poll", Poll);
