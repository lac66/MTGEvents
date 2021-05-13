// rootController used for all pages except connections
var express = require('express');

// set up router
var router = express.Router();

// get index page
router.get('/', function(req, res) {
    res.render('index', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
});

// get about page
router.get('/about', function(req, res) {
    res.render('about', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
});

// get contact page
router.get('/contact', function(req, res) {
    res.render('contact', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
});

// root wildcard
router.get('/*', function(req, res) {
    res.render('index', {data: {currentSession: { isLoggedIn: req.session.isLoggedIn, username: req.session.username}}});
});

module.exports = router;