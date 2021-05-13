// User database file
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MTGEvents', {useNewUrlParser: true, useUnifiedTopology: true});

const userModel = require("../models/user");

var getUser = async function(userEmail) {
    return await userModel.User.find({email: userEmail});
}

module.exports.getUser = getUser;