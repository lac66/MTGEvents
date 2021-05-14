var express = require("express");
const {check, validationResult } = require('express-validator');
var userModel = require('../models/user');
var userProfileModel = require('../models/userProfile');
var connectionModel = require('../models/connection');
var userDB = require('../utilities/userDB');
var connectionDB = require('../utilities/connectionDB');
var userProfileDB = require('../utilities/UserProfileDB');

var router = express.Router();

// get login page
router.get("/login", function(req, res) {
    if (typeof(req.session.loginError) != "undefined" && req.session.loginError.hasLoginFailed) {
        var errorCheck = req.session.loginError.hasLoginFailed;
        req.session.loginError.hasLoginFailed = false;
        res.render('login', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}, hasLoginFailed: errorCheck, errorMessage: req.session.loginError.errorMessage}});
    } else {
        res.render('login', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
    }
});

// handle login form submission
router.post('/login', [
    check('username')
        .isEmail()
        .withMessage("Username must be an email"),
    check('password')
        .isLength({min: 8})
        .withMessage("Password must have at least 8 characters")
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorMessage = [];
        errors.array().forEach(function(item) {
            var msg = item.param + " : " + item.msg;
            errorMessage.push(msg);
        });
        req.session.loginError = {hasLoginFailed: true, errorMessage: errorMessage};
        res.redirect('/user/login');
    } else {
        var userPromise = userDB.getUser(req.body.username);
        userPromise.then(function(user) {
            if (user.length != 0) {
                if (user[0].password == req.body.password) {
                    // set logged in variable to true
                    if (typeof(req.session.loginError) != "undefined") {
                        req.session.loginError.hasLoginFailed = false;
                    }
                    req.session.isLoggedIn = true;
                    req.session.user = user[0];
                    req.session.username = user[0].fName;
                    // find userProfile
                    var userProfilePromise = userProfileDB.getUserProfile(user[0].getId());
                    userProfilePromise.then(function(userProfile) {
                        if (userProfile.length == 0) {
                            // if no userprofile, create one
                            var newUserProfile = new userProfileModel.UserProfile({userId: user[0].getId(), userConnections: []});
                            userProfileDB.addUserProfile(newUserProfile);
                            req.session.profile = newUserProfile;
                        } else {
                            // instantiate userProfile session object
                            req.session.profile = userProfile[0];
                        }
                        // redirect to savedConnections once logged in
                        res.redirect('/user/savedConnections');
                    });
                } else {
                    req.session.loginError = {hasLoginFailed: true, errorMessage: ["Password : Incorrect Password"]};
                    res.redirect('/user/login');
                }
            } else {
                req.session.loginError = {hasLoginFailed: true, errorMessage: ["Email : Email Not Found"]};
                res.redirect('/user/login');
            }
        });
    }
});

// get signup page
router.get("/signup", function(req, res) {
    if (typeof(req.session.loginError) != "undefined" && req.session.loginError.hasLoginFailed) {
        var errorCheck = req.session.loginError.hasLoginFailed;
        req.session.loginError.hasLoginFailed = false;
        res.render('signup', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}, hasLoginFailed: errorCheck, errorMessage: req.session.loginError.errorMessage}});
    } else {
        res.render('signup', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
    }
});

// handle sign up functionality
router.post("/signup", [
    check('fName')
        .isAlpha()
        .withMessage("First Name can only have letters"),
    check('lName')
        .isAlpha()
        .withMessage("Last Name can only have letters"),
    check('email')
        .isEmail()
        .withMessage("No email entered"),
    check('zip')
        .isNumeric()
        .withMessage("Zip code must be a number"),
    check('password')
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters')
        .custom((password, {req}) => {
            var cPassword = req.body.cPassword;
            console.log(password);
            console.log(cPassword);
            if (password !== cPassword) {
                throw new Error("Passwords must match");
            }
            return true;
        })
        .withMessage('Passwords must match')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorMessage = [];
        errors.array().forEach(function(item) {
            var msg = item.param + " : " + item.msg;
            errorMessage.push(msg);
        });
        req.session.loginError = {hasLoginFailed: true, errorMessage: errorMessage};
        res.redirect('/user/signup');
    } else {
        var fName = req.body.fName;
        var lName = req.body.lName;
        var email = req.body.email;
        var password = req.body.password;
        var line1 = req.body.line1;
        var line2 = req.body.line2;
        var city = req.body.city;
        var state = req.body.state;
        var zip = req.body.zip;
        var country = req.body.country;
    
        var getUsersPromise = userDB.getAllUsers();
        getUsersPromise.then(function(users) {
            var isDuplicateEmail = false;
            users.forEach(function(item) {
                if (item.email === email) {
                    isDuplicateEmail = true;
                } 
            });
            if (isDuplicateEmail) {
                req.session.loginError = {hasLoginFailed: true, errorMessage: ["email : email is already in use"]};
                res.redirect('/user/signup');
            } else {
                var address = userModel.Address({line1: line1, line2: line2, city: city, state: state, zip: zip, country: country});
                var newUser = userModel.User({fName: fName, lName: lName, email: email, password: password, address: address});
                var addUserPromise = userDB.addUser(newUser);
                addUserPromise.then(function(user) {
                    // set logged in variable to true
                    if (typeof(req.session.loginError) != "undefined") {
                        req.session.loginError.hasLoginFailed = false;
                    }
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    req.session.username = user.fName;
                    // create new userProfile
                    var newUserProfile = new userProfileModel.UserProfile({userId: user.getId(), userConnections: []});
                    userProfileDB.addUserProfile(newUserProfile);
                    req.session.profile = newUserProfile;
                    // redirect to savedConnections once logged in
                    res.redirect('/user/savedConnections');
                });
            }
        });
    }
});

// logout function
router.get("/logout", function(req, res) {
    // nullify all session variables and redirect to index
    req.session.isLoggedIn = false;
    req.session.user = null;
    req.session.username = null;
    req.session.profile = null;
    res.redirect("/");
});

// yes, no, and maybe link handlers
// all get id from query string, check for a current session,
// check for update or add, then redirect to savedConnections
router.get('/yes/:id', function(req, res) {
    if (req.session.isLoggedIn) {
        var tempProfile = new userProfileModel.UserProfile({userId: req.session.profile.userId, userConnections: req.session.profile.userConnections});
        if (tempProfile.hasConnection(req.params.id)) {
            var updatePromise = userProfileDB.updateRSVP(req.params.id, tempProfile, "Yes");
            updatePromise.then(function(result) {
                var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                updatedUserProfilePromise.then(function(updatedUserProfile) {
                    req.session.profile = updatedUserProfile[0];
                    res.redirect('/user/savedConnections');
                });
            });
        } else {
            var newConnectionPromise = connectionDB.getConnection(req.params.id);
            newConnectionPromise.then(function(newConnection) {
                var addPromise = userProfileDB.addRSVP(newConnection[0], tempProfile, "Yes");
                addPromise.then(function(result) {
                    var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                    updatedUserProfilePromise.then(function(updatedUserProfile) {
                        req.session.profile = updatedUserProfile[0];
                        res.redirect('/user/savedConnections');
                    });
                });
            });
        }
    } else {
        res.redirect('/user/login');
    }
});

// no link handler, check yes handler for details
router.get('/no/:id', function(req, res) {
    if (req.session.isLoggedIn) {
        var tempProfile = new userProfileModel.UserProfile({userId: req.session.profile.userId, userConnections: req.session.profile.userConnections});
        if (tempProfile.hasConnection(req.params.id)) {
            var updatePromise = userProfileDB.updateRSVP(req.params.id, tempProfile, "No");
            updatePromise.then(function(result) {
                var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                updatedUserProfilePromise.then(function(updatedUserProfile) {
                    req.session.profile = updatedUserProfile[0];
                    res.redirect('/user/savedConnections');
                });
            });
        } else {
            var newConnectionPromise = connectionDB.getConnection(req.params.id);
            newConnectionPromise.then(function(newConnection) {
                var addPromise = userProfileDB.addRSVP(newConnection[0], tempProfile, "No");
                addPromise.then(function(result) {
                    var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                    updatedUserProfilePromise.then(function(updatedUserProfile) {
                        req.session.profile = updatedUserProfile[0];
                        res.redirect('/user/savedConnections');
                    });
                });
            });
        }
    } else {
        res.redirect('/user/login');
    }
});

// maybe link handler, check yes handler for details
router.get('/maybe/:id', function(req, res) {
    if (req.session.isLoggedIn) {
        var tempProfile = new userProfileModel.UserProfile({userId: req.session.profile.userId, userConnections: req.session.profile.userConnections});
        if (tempProfile.hasConnection(req.params.id)) {
            var updatePromise = userProfileDB.updateRSVP(req.params.id, tempProfile, "Maybe");
            updatePromise.then(function(result) {
                var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                updatedUserProfilePromise.then(function(updatedUserProfile) {
                    req.session.profile = updatedUserProfile[0];
                    res.redirect('/user/savedConnections');
                });
            });
        } else {
            var newConnectionPromise = connectionDB.getConnection(req.params.id);
            newConnectionPromise.then(function(newConnection) {
                var addPromise = userProfileDB.addRSVP(newConnection[0], tempProfile, "Maybe");
                addPromise.then(function(result) {
                    var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                    updatedUserProfilePromise.then(function(updatedUserProfile) {
                        req.session.profile = updatedUserProfile[0];
                        res.redirect('/user/savedConnections');
                    });
                });
            });
        }
    } else {
        res.redirect('/user/login');
    }
});

// gets savedConnection page if logged in, redirects to login if not
router.get('/savedConnections', function(req, res) {
    if (req.session.isLoggedIn) {
        // instantiate userProfile object from session data
        var tempProfile = new userProfileModel.UserProfile({userId: req.session.profile.userId, userConnections: req.session.profile.userConnections});
        console.log("/savedConnections userProfile: " + tempProfile);
        res.render('savedConnections', {data: {profile: tempProfile, currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
    } else {
        res.redirect('/user/login');
    }
});

// delete link handler
router.get('/delete/:id', function(req, res) {
    var isUserOwned = false;
    var tempProfile = new userProfileModel.UserProfile({userId: req.session.profile.userId, userConnections: req.session.profile.userConnections});
    var profileUserConnections = tempProfile.getUserConnections();
    for (var i = 0; i < profileUserConnections.length; i++) {
        if (profileUserConnections[i].connection.getId() == req.params.id && tempProfile.getUserId() == profileUserConnections[i].connection.getHostId()) {
            isUserOwned = true;
            break;
        }
    }
    console.log("isUserOwned : " + isUserOwned);
    console.log("req.params.id : " + req.params.id);
    console.log("tempProfile : " + tempProfile);

    if (isUserOwned) {
        var deleteConnectionPromise = userProfileDB.deleteConnection(req.params.id);
        deleteConnectionPromise.then(function(result) {
            var deleteRSVPPromise = userProfileDB.deleteRSVP(req.params.id, tempProfile);
            deleteRSVPPromise.then(function(result) {
                var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                updatedUserProfilePromise.then(function(updatedUserProfile) {
                    req.session.profile = updatedUserProfile[0];
                    res.redirect('/user/savedConnections');
                });
            });
        });
    } else {
        var deleteRSVPPromise = userProfileDB.deleteRSVP(req.params.id, tempProfile);
        deleteRSVPPromise.then(function(result) {
            var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
            updatedUserProfilePromise.then(function(updatedUserProfile) {
                req.session.profile = updatedUserProfile[0];
                res.redirect('/user/savedConnections');
            });
        });
    }
});

// gets newConnection page if logged in, redirects to login if not
router.get('/newConnection', function(req, res) {
    if (req.session.isLoggedIn) {
        if (typeof(req.session.newConnectionError) != "undefined" && req.session.newConnectionError.hasErrorOccurred) {
            var errorCheck = req.session.newConnectionError.hasErrorOccurred;
            req.session.newConnectionError.hasErrorOccurred = false;
            res.render('newConnection', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}, hasLoginFailed: errorCheck, errorMessage: req.session.newConnectionError.errorMessage}});
        } else {
            res.render('newConnection', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
        } 
    } else {
        res.redirect('/user/login');
    }
});

// gets newConnection page to edit existing connections
router.get('/newConnection/:id', function(req, res) {
    if (req.session.isLoggedIn) {
        if (req.params.id == "connections") {
            res.redirect('/connections');
        } else if (req.params.id == "savedConnections") {
            res.redirect('/user/savedConnections')
        } else {
            var updateConnectionPromise = connectionDB.getConnection(req.params.id);
            updateConnectionPromise.then(function(updateConnection) {
                if (typeof(req.session.newConnectionError) != "undefined" && req.session.newConnectionError.hasErrorOccurred) {
                    var errorCheck = req.session.newConnectionError.hasErrorOccurred;
                    req.session.newConnectionError.hasErrorOccurred = false;
                    res.render('newConnection', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}, updateConnection: updateConnection[0], hasLoginFailed: errorCheck, errorMessage: req.session.newConnectionError.errorMessage}});
                } else {
                    res.render('newConnection', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}, updateConnection: updateConnection[0]}});
                }
            });
        }
    } else {
        res.redirect('/user/login');
    }
});

// handles storing new connection
router.post('/newConnection', [
    // data validation
    check('topic')
        .isLength({min: 3, max: 12})
        .withMessage("length must be between 3 and 12 characters"),
    check('name')
        .isLength({min: 3, max: 25})
        .withMessage("length must be between 3 and 25 characters"),
    check('where')
        .isLength({min: 3, max: 25})
        .withMessage("length must be between 3 and 25 characters"),
    check('when')
        .isISO8601()
        .withMessage("must be a date")
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorMessage = [];
        errors.array().forEach(function(item) {
            var msg = item.param + " : " + item.msg;
            errorMessage.push(msg);
        });
        req.session.newConnectionError = {hasErrorOccurred: true, errorMessage: errorMessage};
        res.redirect('/user/newconnection');
    } else {
        var tempProfile = new userProfileModel.UserProfile({userId: req.session.profile.userId, userConnections: req.session.profile.userConnections});
        var hostName = req.session.user.fName + " " + req.session.user.lName;
        var newConnection = new connectionModel.Connection({
            name: req.body.name,
            host: hostName,
            hostId: req.session.user._id.toString(),
            topic: req.body.topic,
            details: req.body.details,
            date: req.body.when,
            location: req.body.where
        });
        var addConnectionPromise = userProfileDB.addConnection(newConnection);
        addConnectionPromise.then(function(result) {
            var addPromise = userProfileDB.addRSVP(newConnection, tempProfile, "Yes");
            addPromise.then(function(result) {
                var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                updatedUserProfilePromise.then(function(updatedUserProfile) {
                    req.session.profile = updatedUserProfile[0];
                    res.redirect('/user/savedConnections');
                });
            });
        });
    }
});

// handles updating connection
router.post('/newConnection/:id', [
    check('topic')
        .isLength({min: 3, max: 12})
        .withMessage("length must be between 3 and 12 characters"),
    check('name')
        .isLength({min: 3, max: 25})
        .withMessage("length must be between 3 and 25 characters"),
    check('where')
        .isLength({min: 3, max: 25})
        .withMessage("length must be between 3 and 25 characters"),
    check('when')
        .isISO8601()
        .withMessage("must be a date")
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var errorMessage = [];
        errors.array().forEach(function(item) {
            var msg = item.param + " : " + item.msg;
            errorMessage.push(msg);
        });
        req.session.newConnectionError = {hasErrorOccurred: true, errorMessage: errorMessage};
        res.redirect('/user/newconnection/' + req.params.id);
    } else {
        var tempProfile = new userProfileModel.UserProfile({userId: req.session.profile.userId, userConnections: req.session.profile.userConnections});
        var hostName = req.session.user.fName + " " + req.session.user.lName;
        var updateConnection = new connectionModel.Connection({
            _id: req.params.id,
            name: req.body.name,
            host: hostName,
            hostId: req.session.user._id.toString(),
            topic: req.body.topic,
            details: req.body.details,
            date: req.body.when,
            location: req.body.where
        });
        var deleteRSVPPromise = userProfileDB.deleteRSVP(req.params.id, tempProfile);
        deleteRSVPPromise.then(function(result) {
            var addConnectionPromise = userProfileDB.updateConnection(updateConnection);
            addConnectionPromise.then(function(result) {
                var addPromise = userProfileDB.addRSVP(updateConnection, tempProfile, "Yes");
                addPromise.then(function(result) {
                    var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
                    updatedUserProfilePromise.then(function(updatedUserProfile) {
                        req.session.profile = updatedUserProfile[0];
                        res.redirect('/user/savedConnections');
                    });
                });
            });
        });
    }
});

// redirects for connections and root controllers
router.get('/connections', function(req, res) {
    res.redirect('/connections');
});

router.get('/about', function(req, res) {
    res.redirect('/about');
});

router.get('/contact', function(req, res) {
    res.redirect('/contact');
});

module.exports = router;