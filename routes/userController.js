var express = require("express");
var userProfileModel = require('../models/userProfile');
var connectionModel = require('../models/connection');
var userDB = require('../utilities/userDB');
var connectionDB = require('../utilities/connectionDB');
var userProfileDB = require('../utilities/UserProfileDB');

var router = express.Router();

// get login page
router.get("/login", function(req, res) {
    res.render('login', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
});

// handle login form submission
router.post('/login', function(req, res) {
    // checks if name entered, assigns default name if not
    if (req.body.username != undefined && req.body.username != "") {
        var userPromise = userDB.getUser(req.body.username);
        userPromise.then(function(user) {
            if (user[0] != undefined) {
                // set logged in variable to true
                req.session.isLoggedIn = true;
                req.session.user = user[0];
                req.session.username = user[0].fName;
                // find userProfile
                var userProfilePromise = userProfileDB.getUserProfile(user[0].getId());
                userProfilePromise.then(function(userProfile) {
                    if (userProfile.length == 0) {
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
                res.redirect('/user/login');
            }
        });
    } else {
        // set logged in variable to true
        req.session.isLoggedIn = true;
        var userPromise = userDB.getUser("norm@niner.edu");
        userPromise.then(function(user) {
            req.session.user = user[0];
            req.session.username = user[0].fName;
            // find userProfile
            var userProfilePromise = userProfileDB.getUserProfile(user[0].getId());
            userProfilePromise.then(function(userProfile) {
                // instantiate userProfile session object
                req.session.profile = userProfile[0];
                // redirect to savedConnections once logged in
                res.redirect('/user/savedConnections');
            });
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

// // delete link handler
// router.get('/delete/:id', function(req, res) {
//     var tempProfile = new userProfileModel.UserProfile({userId: req.session.profile.userId, userConnections: req.session.profile.userConnections});
//     var deleteRSVPPromise = userProfileDB.deleteRSVP(req.params.id, tempProfile);
//     deleteRSVPPromise.then(function(result) {
//         var updatedUserProfilePromise = userProfileDB.getUserProfile(tempProfile.getUserId());
//         updatedUserProfilePromise.then(function(updatedUserProfile) {
//             req.session.profile = updatedUserProfile[0];
//             res.redirect('/user/savedConnections');
//         });
//     });
// });

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
        res.render('newConnection', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
    } else {
        res.redirect('/user/login');
    }
});

// handles storing new connection
router.post('/newConnection', function(req, res) {
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