// userConnection class
const mongoose = require('mongoose');
const connectionModel = require('./connection');
mongoose.connect('mongodb://localhost/MTGEvents', {useNewUrlParser: true, useUnifiedTopology: true});

const userConnectionSchema = new mongoose.Schema({
    connection: connectionModel.connectionSchema,
    rsvp: String
});

userConnectionSchema.methods.getId = function() {
    return this._id.toString();
}

userConnectionSchema.methods.getRsvp = function() {
    return this.rsvp;
}

userConnectionSchema.methods.setRsvp = function(newRsvp) {
    return this.rsvp = newRsvp;
}

userConnectionSchema.methods.getConnection = function() {
    return this.connection;
}

const UserConnection = mongoose.model("UserConnection", userConnectionSchema);


module.exports.UserConnection = UserConnection;
module.exports.userConnectionSchema = userConnectionSchema;