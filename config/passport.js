const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const Users = mongoose.model('Users');

passport.use(
    'login',
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false,
    }, (username, password, done) => {
        Users.findOne({$or: [{username: username}, {email: username}]})
            .then((user) => {
                if (!user) {
                    return done(null, false, 'Account does not exist');
                } else {
                    bcrypt.compare(password, user.password, function (err, response) {
                        if (!response) {
                            return done(null, false, 'Username or password is invalid.');
                        }
                        if (user.banned) {
                            return done(null, false, user.banMessage);
                        }
                        return done(null, user);
                    });
                }
            }).catch(done);
    }));

passport.use(
    'register',
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        emailField: 'email',
        passReqToCallback: true,
        session: false,
    }, (req, username, password, done) => {
        try {
            Users.findOne({
                $or: [{username: username}, {email: req.body.email}]
            })
                .then(user => {
                    if (user !== null) {
                        return done(null, false, "Account already exists.");
                    } else {
                        bcrypt.hash(password, 12, function (err, hash) {
                            if (err) {
                                console.log(err);
                            }
                            Users.create({username: username, password: hash, email: req.body.email}).then(user => {
                                return done(null, user);
                            }).catch((err) => {
                                return done(err, false);
                            });
                        });
                    }
                });
        } catch (err) {
            done(err);
        }
    }));

const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) token = req.cookies['jwt'];
    return token;
};

module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = cookieExtractor;
    opts.secretOrKey = process.env.JWT_SECRET;
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        Users.findOne({id: jwt_payload.id}, function (err, user) {
            if (err) {
                return done(null, false, err);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};