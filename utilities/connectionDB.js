// Connection database file
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MTGEvents', {useNewUrlParser: true, useUnifiedTopology: true});

const connectionModel = require("../models/connection");

// gets all connections
var getConnections = async function() {
    console.log("getConnections");
    return await connectionModel.Connection.find({});
}

// gets specific connection based on connectionID
var getConnection = async function(connectionId) {
    return await connectionModel.Connection.find({_id: connectionId});
}

module.exports.getConnections = getConnections;
module.exports.getConnection = getConnection;