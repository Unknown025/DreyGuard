const express = require('express');
const router = express.Router();

const updateRouter = require('./update');
const adminRouter = require('./admin');

router.get('/', function (req, res, next) {
    res.render('index', {title: 'DreyGuard'});
});

router.use('/update', updateRouter);

router.use('/admin', adminRouter);

module.exports = router;
