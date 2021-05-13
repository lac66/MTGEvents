const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MTGEvents', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

const connectionSchema = new mongoose.Schema({
    name: String,
    host: String,
    hostId: String,
    topic: String,
    details: String,
    date: Date,
    location: String
}, {collection: 'connections'});

connectionSchema.methods.getId = function() {
    return this._id.toString();
}

connectionSchema.methods.getName = function() {
    return this.name;
}

connectionSchema.methods.getHost = function() {
    return this.host;
}

connectionSchema.methods.getHostId = function() {
    return this.hostId;
}

connectionSchema.methods.getTopic = function() {
    return this.topic;
}

connectionSchema.methods.getDetails = function() {
    return this.details;
}

connectionSchema.methods.getDate = function() {
    return this.date.toString();
}

connectionSchema.methods.getLocation = function() {
    return this.location;
}

const Connection = mongoose.model('Connection', connectionSchema);

module.exports.Connection = Connection;
module.exports.connectionSchema = connectionSchema;