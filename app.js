const createError = require('http-errors');
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const app = express();

require('./models/Users');
require('./models/UpdateFile');
require('./models/Update');
require('./config/passport');

const indexRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(path.join('./public')));

mongoose.promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost/dreyguard-database', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).catch((err) => {
    console.error('ERROR: Could not connect to DreyGuard database.', err);
});
mongoose.set('debug', true);

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env').toUpperCase() === 'DEVELOPMENT' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;