const jsonWebToken = require('jsonwebtoken');
const createError = require('http-errors');

const getTokenFromCookie = (req) => {
    let token = null;
    if (req && req.cookies) token = req.cookies['jwt'];
    return token;
};

function verifyUser(req, res, next) {
    const token = getTokenFromCookie(req);
    if (!token) {
        return next(createError(401, 'You must be logged in to access this page.'));
    }
    const user = jsonWebToken.verify(token, process.env.JWT_SECRET || 'secret');
    if (!user) {
        return next(createError(401, 'You must be logged in to access this page.'));
    }
    req.user = user;
    next();
}

function verifyOptional(req, res, next) {
    const token = getTokenFromCookie(req);
    if (!token) {
        return next();
    }
    const user = jsonWebToken.verify(token, process.env.JWT_SECRET || 'secret');
    if (!user) {
        return next(createError(401, 'Your authentication session has expired.'));
    }
    req.user = user;
    next();
}

module.exports = {verifyUser, verifyOptional};