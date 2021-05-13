// UserProfile database file
const mongoose = require('mongoose');
const userProfileModel = require('../models/userProfile');
mongoose.connect('mongodb://localhost/MTGEvents', {useNewUrlParser: true, useUnifiedTopology: true});

const userConnectionModel = require("../models/userConnection");
const connectionModel = require("../models/connection");

var getUserProfile = async function(findUserId) {
    return await userProfileModel.UserProfile.find({userId: findUserId});
}

var addUserProfile = async function(userProfile) {
    return await userProfile.save();
}

var addRSVP = async function(newConnection, userProfile, rsvp) {
    var updatedUserConnections = userProfile.getUserConnections();
    console.log("addRSVP Old userConnections: " + updatedUserConnections);
    updatedUserConnections.push({connection: newConnection, rsvp: rsvp});
    console.log("addRSVP New userConnections: " + updatedUserConnections);
    return await userProfileModel.UserProfile.updateOne({userId: userProfile.getUserId()}, {userId: userProfile.getUserId(), userConnections: updatedUserConnections});
}

var updateRSVP = async function(updateConnectionId, userProfile, rsvp) {
    var updatedUserConnections = userProfile.getUserConnections();
    for (var i = 0; i < updatedUserConnections.length; i++) {
        if (updatedUserConnections[i].connection.getId() == updateConnectionId) {
            updatedUserConnections[i].setRsvp(rsvp);
        }
    }
    return await userProfileModel.UserProfile.updateOne({userId: userProfile.getUserId()}, {userId: userProfile.getUserId(), userConnections: updatedUserConnections});
}

var deleteRSVP = async function(delConnectionId, userProfile) {
    var updatedUserConnections = userProfile.getUserConnections();
    for (var i = 0; i < updatedUserConnections.length; i++) {
        if (updatedUserConnections[i].connection.getId() == delConnectionId) {
            updatedUserConnections.splice(i, 1);
        }
    }
    return await userProfileModel.UserProfile.updateOne({userId: userProfile.getUserId()}, {userId: userProfile.getUserId(), userConnections: updatedUserConnections});
}

var addConnection = async function(newConnection) {
    return await newConnection.save();
}

var deleteConnection = async function(connectionId) {
    return await connectionModel.Connection.deleteOne({_id: connectionId});
}

module.exports.getUserProfile = getUserProfile;
module.exports.addUserProfile = addUserProfile;
module.exports.addRSVP = addRSVP;
module.exports.updateRSVP = updateRSVP;
module.exports.deleteRSVP = deleteRSVP;
module.exports.addConnection = addConnection;
module.exports.deleteConnection = deleteConnection;