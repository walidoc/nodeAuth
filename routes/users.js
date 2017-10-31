var express = require('express');
var router = express.Router();

var User = require('../models/user');

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
    res.render('register', {
        'title' : 'Register'
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', {
        'title' : 'Log in'
    });
});

router.post('/register', function(req, res, next) {
    // get form values
    console.log(req.body)  
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;
    
    // Form Validation
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email  not valid').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Confirm Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    // Check for errors
    var errors = req.validationErrors();

    if(errors) {
        res.render('register', {
            errors : errors,
            name : name,
            email : email,
            username : username,
            password : password,
            password2 : password2
        })
    } else {
        var newUser = new User({
            name : name,
            email : email,
            username : username,
            password : password,
            // profileImage : profileImageName
        })

        // Create user
        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        })

        // Success Message
        req.flash('success', 'You are now registered and you may log in');
        res.location('/');
        res.redirect('/');
    }

});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new localStrategy(function(username, password, done){
    User.getUserByUsername(username, function(err, user){
        if(err) throw err;
        if(!user){
            console.log('Unknown user');
            return done(null, false, {message: 'Unknown user'})
        }

        User.comparePassword(password, user.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch) {
                return done(null, user)
            } else {
                console.log('Invalid Password')
                return done(null, false, {message: 'Invalid Password'})
            }
        })
    })
}))

router.post('/login', passport.authenticate('local', {failureRedirect:'/users/login', failureFlash:'Invalid password or username'}), function(req, res){
    console.log('Authentication successful');
    req.flash('success', 'You are logged in');
    res.redirect('/')
})

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/users/login');
})

module.exports = router;
