"use strict";

const Poll = require("../models/polls");
const User = require("../models/users");

module.exports = {
    new: (req, res) => {
        const options = parseOptions(req.body);
        if (req.user.body !== "" && options.length > 1) {
            let newPoll = new Poll({
                title: req.body.title,
                date: new Date(),
                options: options
            });
            newPoll.votes = initVotes(options.length);
            newPoll.save();

            req.user.polls.push(newPoll._id);
            req.user.save((err) => {
                res.redirect("/polls");
            });
        } else {
            res.redirect("/polls");
        }
    },
    vote: vote,
    index: (req, res) => {
        Poll.find({}, (err, polls) => {
            res.render("polls", {polls: polls});
        });
    },
    getNewForm: (req, res) => {
        res.render("polls/new");
    },
    show: (req, res) => {
        Poll.find({}, (err, polls) => {
            if (req.params.id >= 0 && req.params.id < polls.length)
                res.render("polls/show", {poll: polls[req.params.id], owned: isOwned(polls[req.params.id], req.user), i: req.params.id, alreadyVoted: alreadyVoted(req, polls[req.params.id])});
            else
                res.redirect("/polls");
        });
    },
    delete: (req, res) => {
        Poll.find({}, (err, polls) => {
            const poll = polls[req.params.id];
            if (isOwned(poll, req.user))
                Poll.remove({_id: poll._id}, (err) => {
                    res.redirect("/polls");
                });
            else
                res.redirect("/polls");
        });
    },
    new_user: (req, res) => {
        if (req.flash("redirect")[0] === "new") {
            res.redirect("/polls/new");
        } else {
            res.redirect("/polls");
        }

        Poll.find({}, (err, polls) => {
            polls.forEach((poll) => {
                poll.ipsThatVoted.forEach((ip, i) => {
                    if (ip === (req.ip || req.ips[0])) {
                        if (!poll.usersWhoVoted.includes(ip)) {
                            poll.usersWhoVoted.push(req.user._id);
                            poll.save();
                        }
                    }
                });
            });
        });
    },
    new_option: (req, res) => {
        Poll.find({}, (err, polls) => {
            const poll = polls[req.params.id];
            if (!alreadyVoted(req, poll)) {
                if (req.body && req.body.new) {
                    poll.options.push(req.body.new);
                    poll.votes.push(0);
                    poll.save(() => {
                        req.body.choice = poll.options.length - 1;
                        vote(req, res);
                    });
                } else {
                    res.redirect(`/polls/${req.params.id}`);
                }
            } else {
                res.redirect(`/polls/${req.params.id}`);
            }
        });
    },
    getData: (req, res) => {
        Poll.find({}, (err, polls) => {
            if (req.params.id >= 0 && req.params.id < polls.length) {
                const poll = polls[req.params.id];
                const response = [];
                poll.options.forEach((option, i) => {
                    response.push({
                        option: option,
                        votes: poll.votes[i]
                    });
                })
                res.send(response)
            } else
                res.send({error: "Invalid poll id."});
        });
    }
};

function vote(req, res) {
    Poll.find({}, (err, polls) => {
        const poll = polls[req.params.id];
        if (alreadyVoted(req, poll))
            req.flash("errorMessages", "You already voted on this poll.");
        else {
            if (req.user)
                poll.usersWhoVoted.push(req.user._id);
            poll.ipsThatVoted.push(req.ip || req.ips[0]);
            if (req.body && req.body.choice) {
                poll.votes[req.body.choice]++;
                poll.markModified("votes");
                poll.save(() => {
                    res.redirect(`/polls/${req.params.id}`);
                });
                return;
            }
        }
        res.redirect(`/polls/${req.params.id}`);
    });
}

function alreadyVoted(req, poll) {
    return (req.user && poll.usersWhoVoted.map((id) => id.toHexString()).includes(req.user._id.toHexString())) || poll.ipsThatVoted.includes(req.ip || req.ips[0]);
}

function isOwned(poll, user) {
    if (user)
        for (let i = 0; i < user.polls.length; i++)
            if (user.polls[i].equals(poll._id))
                return true;
    return false;
}

function initVotes(numOptions) {
    let votes = [];
    for (let i = 0; i < numOptions; i++)
        votes.push(0);
    return votes;
}

function parseOptions(body) {
    let options = [];
    let i = 0;
    while (body[`option-${i}`]) {
        options.push(body[`option-${i}`]);
        i++;
    }
    return options;
}
