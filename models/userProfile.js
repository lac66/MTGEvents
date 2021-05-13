// userProfile class
const mongoose = require('mongoose');
const userConnectionModel = require('./userConnection');
mongoose.connect('mongodb://localhost/MTGEvents', {useNewUrlParser: true, useUnifiedTopology: true});

const userProfileSchema = new mongoose.Schema({
    userId: String,
    userConnections: [userConnectionModel.userConnectionSchema]
}, {collection: 'userprofiles'});

userProfileSchema.methods.getUserId = function() {
    return this.userId;
}

// gets all userConnections
userProfileSchema.methods.getUserConnections = function() {
    return this.userConnections;
}

// checks if userConnections has connection with given id
userProfileSchema.methods.hasConnection = function(id) {
    for (var i = 0; i < this.userConnections.length; i++ ) {
        if (id == this.userConnections[i].connection.id) {
            return true;
        }
    }
    return false;
}

// adds connection to userConnections
userProfileSchema.methods.addConnection = function(newConnection, newRsvp) {
    if (!this.hasConnection(newConnection.getId())) {
        this.userConnections.push(userConnection.userConnection(newConnection.getId(), newRsvp));
    }
}

// deletes connection from userConnections
userProfileSchema.methods.deleteConnection = function(userConnectionDelId) {
    for (var i = 0; i < this.userConnections.length; i++) {
        if (this.userConnections[i].connection.id == userConnectionDelId) {
            this.userConnections.splice(i, 1);
            return;
        }
    }
}

// updates rsvp for single userConnection
userProfileSchema.methods.updateRSVP = function(oldConnection, newRsvp) {
    for (var i = 0; i < this.userConnections.length; i++) {
        if (this.userConnections[i].connection.id == oldConnection.getId()) {
            this.userConnections[i].rsvp = newRsvp;
            return;
        }
    }
}

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// var userProfile = function(userId, connections) {
//     var userProfileModel = {
//         userId: userId,
//         userConnections: connections,
//         getUserId: function() {
//             return this.userId;
//         },
//         // adds connection to userConnections
//         addConnection: function(newConnection, newRsvp) {
//             if (!this.hasConnection(newConnection.getId())) {
//                 this.userConnections.push(userConnection.userConnection(newConnection.getId(), newRsvp));
//             }
//         },
//         // deletes connection from userConnections
//         deleteConnection: function(userConnectionDelId) {
//             for (var i = 0; i < this.userConnections.length; i++) {
//                 if (this.userConnections[i].connection.id == userConnectionDelId) {
//                     this.userConnections.splice(i, 1);
//                     return;
//                 }
//             }
//         },
//         // updates rsvp for single userConnection
//         updateRSVP: function(oldConnection, newRsvp) {
//             for (var i = 0; i < this.userConnections.length; i++) {
//                 if (this.userConnections[i].connection.id == oldConnection.getId()) {
//                     this.userConnections[i].rsvp = newRsvp;
//                     return;
//                 }
//             }
//         },
//         // gets all userConnections
//         getUserConnections() {
//             return this.userConnections;
//         },
//         // checks if userConnections has connection with given id
//         hasConnection(id) {
//             for (var i = 0; i < this.userConnections.length; i++ ) {
//                 if (id == this.userConnections[i].connection.id) {
//                     return true;
//                 }
//             }
//             return false;
//         }
//     };
//     return userProfileModel;
// }

module.exports.UserProfile = UserProfile;
