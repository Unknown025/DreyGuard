// error handler
function errorHandler(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.DEV === 'DEVELOPMENT' ? err : {};
    res.status(err.status || 500);
    if (process.env.DEV === 'DEVELOPMENT') {
        res.render('error', {title: 'Error ' + (err.status || 500)});
    } else {
        if (err.status === 401) {
            res.render('errors/error401', {title: 'Error 401', message: err.message});
        } else if (err.status === 403) {
            res.render('errors/error403', {title: 'Error 403', message: err.message});
        } else if (err.status === 404) {
            res.render('errors/error404', {title: 'Error 404', message: err.message, path: req.url});
        } else if (err.status === 410) {
            res.render('errors/error410', {title: 'Error 410', message: err.message, path: req.url});
        } else {
            res.render('errors/error500', {title: 'Error 500', message: err.message});
        }
    }
    next();
}

module.exports = errorHandler;