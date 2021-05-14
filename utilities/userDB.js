// User database file
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MTGEvents', {useNewUrlParser: true, useUnifiedTopology: true});

const userModel = require("../models/user");

var getAllUsers = async function() {
    return await userModel.User.find({});
}

var getUser = async function(userEmail) {
    return await userModel.User.find({email: userEmail});
}

var addUser = async function(user) {
    return await user.save();
}

module.exports.getAllUsers = getAllUsers;
module.exports.getUser = getUser;
module.exports.addUser = addUser;