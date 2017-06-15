"use strict";

module.exports = {
    forceLogIn: (req, res, next) => {
        if (req.isAuthenticated()) return next();
        else res.redirect("/login");
    }
}
