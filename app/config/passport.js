"use strict";

const GitHubStrategy = require("passport-github").Strategy;
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

    passport.use(new GitHubStrategy(configAuth.githubAuth, (token, refresh, profile, cb) => {
        process.nextTick(() => {
            User.findOne({"github.id": profile.id}, (err, user) => {
                if (err) return cb(err);
                if (user) return cb(null, user);
                else {
                    let newUser = new User();

                    newUser.github.id = profile.id;
                    newUser.github.username = profile.username;
                    newUser.github.displayName = profile.displayName;

                    newUser.save((err) => {
                        if (err) throw err;
                        return cb(null, newUser);
                    });
                }
            });
        });
    }));
};
