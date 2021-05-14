var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var connectionController = require('./routes/connectionController.js');
var userController = require('./routes/userController.js');
var rootController = require('./routes/rootController.js');
var app = express();

// server setup
app.set('view engine', 'ejs');
app.use(express.json());
app.use('/resources', express.static('resources'));
app.use('/utilities', express.static('utilities'));

// session setup
app.use(session({secret: "the_MTG_secret", saveUninitialized: true, resave: true}));
app.use(bodyParser.urlencoded({extended: true}));

// set routes
app.use('/connections', connectionController);
app.use('/user', userController);
app.use('/', rootController);

// server listening to port
app.listen(8080, function() {
    console.log('server starting');
    console.log('listening on port 8080');
})

