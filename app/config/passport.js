"use strict";

const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../models/users");
const configAuth = require("./auth");

module.exports = (passport) => {
    passport.serializeUser((user, cb) => {
        cb(null, user.id);
    });

    passport.deserializeUser((id, cb) => {
        User.findById(id, (err, user) => {
            cb(err, user);
        });
    });

    passport.use(new TwitterStrategy(configAuth.twitterAuth, (token, refresh, profile, cb) => {
        process.nextTick(() => {
            User.findOne({"twitter.id": profile.id}, (err, user) => {
                if (err) return cb(err);
                if (user) return cb(null, user);
                else {
                    let newUser = new User();

                    newUser.twitter.id = profile.id;
                    newUser.twitter.username = profile.username;
                    newUser.twitter.displayName = profile.displayName;

                    newUser.save((err) => {
                        if (err) throw err;
                        return cb(null, newUser);
                    });
                }
            });
        });
    }));
};
