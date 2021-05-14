// User class file
const mongoose = require('mongoose');
const userConnectionModel = require('./userConnection');
mongoose.connect('mongodb://localhost/MTGEvents', {useNewUrlParser: true, useUnifiedTopology: true});

const addressSchema = new mongoose.Schema({
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: Number,
    country: String
}, {collection: 'addresses'});

const Address = mongoose.model('Address', addressSchema);

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: addressSchema
    // rsvpConnections: {
    //     type: [userConnectionModel.userConnectionSchema],
    //     default: []
    // }
}, {collection: 'users'});

userSchema.methods.getId = function() {
    return this._id.toString();
}

userSchema.methods.getFName = function() {
    return this.fName;
}

userSchema.methods.getLName = function() {
    return this.lName;
}

userSchema.methods.getEmail = function() {
    return this.email;
}

userSchema.methods.getAddress = function() {
    return this.address;
}

// userSchema.methods.getRsvpConnections = function() {
//     return this.rsvpConnections;
// }

userSchema.methods.setAddress = function() {

}

const User = mongoose.model('User', userSchema);


module.exports.User = User;
module.exports.Address = Address;