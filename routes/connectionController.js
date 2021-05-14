var express = require('express');
var connectionDB = require('../utilities/connectionDB');
var connectionModel = require('../models/connection');

// set up router and database connection
var router = express.Router();

// get links, redirects are for smooth transitions from details page
router.get('/', function(req, res) {
    console.log("router.get/connections");
    var databasePromise = connectionDB.getConnections();
    databasePromise.then(function(database) {
        res.render('connections', {data: { database: database, currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
    });
});

// redirect to newConnection page
router.get('/newConnection', function(req, res) {
    res.redirect('/user/newConnection');
});

// redirect to savedConnections page
router.get('/savedConnections', function(req, res) {
    res.redirect('/user/savedConnections');
});

// redirect to about page
router.get('/about', function(req, res) {
    res.redirect('/about');
});

// redirect to contact page
router.get('/contact', function(req, res) {
    res.redirect('/contact');
});

// get connection details page
// :id to get specific connection
// also handles update link
router.get('/:id', function(req, res) {
    console.log("router.get/:id " + req.params.id);
    if (req.params.id == "connections") {
        res.redirect('/connections');
    } else if (req.params.id == "savedConnections") {
        res.redirect('/user/savedConnections');
    } else {
        var connectionPromise = connectionDB.getConnection(req.params.id);
        connectionPromise.then(function(connection) {
            if (connection == undefined) {
                res.redirect('/connections');
            } else {
                console.log(connection);
                res.render('connection', {data: {connection: connection[0], currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
            }
        });
    }
});

// wildcard for connections
router.get('/*', function(req, res) {
    res.redirect('/connections');
});

module.exports = router;