var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;

// user schema 
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String, 
        required: true, 
        bcrypt: true
    },
    email: {
        type: String
    },
    name: {
        type: String
    }
})

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserByUsername = function(username, cb){
    var query = {username : username}
    User.findOne(query, cb)
}

module.exports.getUserById = function(id, cb){
    User.findById(id, cb)
}

module.exports.comparePassword = function(password, hash, cb){
    bcrypt.compare(password, hash, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

module.exports.createUser = function(newUser, cb) {
    bcrypt.hash(newUser.password, 10, function(err, hash){
        if (err) throw err;
        newUser.password = hash;
        newUser.save(cb);
    })
    
}