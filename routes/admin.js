const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../utils/auth');
const crypto = require('crypto');
const passport = require('passport');
const mongoose = require('mongoose');
const Update = mongoose.model('Update');
const UpdateFile = mongoose.model('UpdateFile');
const semver = require('semver');
const createError = require('http-errors');

router.get('/', auth.verifyUser, function (req, res) {
    res.render('admin/index', {title: 'Admin'});
});

router.get('/login', function (req, res) {
    res.render('admin/login', {title: 'Login'});
});

router.get('/register', function (req, res, next) {
    if (process.env.ENABLE_SIGNUP === 'true') {
        res.render('admin/register', {title: 'Register'});
    } else {
        next(createError(503, 'This page is not available.'));
    }
});

router.post('/login', auth.verifyOptional, (req, res, next) => {
    const user = req.body;
    if (user === undefined) {
        return res.status(406).json({
            message: "Invalid"
        })
    }

    if (!user.username) {
        return res.status(422).json({
            message: "Username is required",
            username: true
        });
    }

    if (!user.password) {
        return res.status(422).json({
            message: "Password is required",
            password: true
        });
    }

    return passport.authenticate('login', {}, function (err, user, info) {
        if (err) {
            return next(err);
        }

        if (user) {
            return res.status(200).json({session: user.generateJWT()});
        } else {
            return res.status(400).json({message: info});
        }
    })(req, res, next);
});

router.post('/register', auth.verifyOptional, (req, res, next) => {
    if (process.env.ENABLE_SIGNUP !== 'true') {
        return res.status(503).end();
    }
    const user = req.body;
    if (user === undefined) {
        return res.status(406).json({
            message: "Invalid"
        })
    }

    if (!user.username) {
        return res.status(422).json({
            message: 'Username is required'
        });
    }

    if (!user.email) {
        return res.status(422).json({
            message: 'Email is required'
        });
    }

    if (!user.password) {
        return res.status(422).json({
            message: 'Password is required'
        });
    }

    return passport.authenticate('register', {}, function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (user) {
            return res.status(200).json({session: user.generateJWT()});
        } else {
            return res.status(400).json({message: info});
        }
    })(req, res, next);
});

router.post('/release', auth.verifyUser, function (req, res) {
    const json = req.body;
    if (!json || !json.name || !json.id || !json.platform || !json.version) {
        return res.status(400);
    }
    if (json.platform !== "darwin" && json.platform !== "win32" && json.platform !== "win32-x64") {
        return res.status(400).json({
            error: true,
            message: "Platform not provided in correct format. Must be one of the following: darwin, win32, or win32-x64."
        });
    }
    if (!semver.valid(json.version)) {
        return res.status(400).json({
            error: true,
            message: "Version is not in correct semantic version format."
        })
    }
    Update.create({
        name: json.name,
        forId: json.id.toLowerCase(),
        major: semver.major(json.version),
        minor: semver.minor(json.version),
        patch: semver.patch(json.version),
        platform: (json.platform === 'win32-x64') ? 'win32' : json.platform,
        arch: (json.platform === 'win32') ? 'x86' : 'x64'
    }).then((update) => {
        return res.status(200).json(JSON.stringify(update));
    });
});

router.post('/release/:id/delete', auth.verifyUser, function (req, res) {
    Update.findByIdAndRemove(req.params.id)
        .then((update) => {
            if (!update) {
                res.sendStatus(404);
            } else {
                res.sendStatus(200);
            }
        })
});

router.get('/release', auth.verifyUser, function (req, res) {
    Update.find().exec(function (err, updates) {
        return res.end(JSON.stringify(updates));
    });
});

router.post('/release/:id/file', auth.verifyUser, async function (req, res) {
    const id = req.params.id;
    if (!req.files.file) {
        res.status(400).end();
    } else {
        Update.findById(id).then(async (update) => {
            if (!update) {
                res.status(404).json({error: true, message: "Update not found."}).end();
            } else {
                const filepath = path.resolve('./releases/' + update.forId + '/' + update.platform + '/' + update.arch + '/' + req.files.file.name);
                if (!fs.existsSync(path.dirname(filepath))) {
                    fs.mkdirSync(path.dirname(filepath), {recursive: true});
                }
                await req.files.file.mv(filepath);

                const updateFile = new UpdateFile();
                updateFile.size = req.files.file.size;
                updateFile.filename = path.basename(filepath);
                const hash = await checksumFile('sha1', filepath);
                updateFile.hash = hash.toUpperCase();
                let updated = false;
                for (let i = 0; i < update.files.length; i++) {
                    if (update.files[i].filename === updateFile.filename) {
                        update.files[i] = updateFile;
                        updated = true;
                        console.warn('Update file already exists, updating document.');
                    }
                }
                if (!updated) {
                    update.files.push(updateFile);
                }
                Update.updateOne({_id: id}, {$set: update}).then(() => {
                    res.status(200).json({}).end();
                }).catch((err) => {
                    res.status(500).json({error: true, message: "An error occurred. " + err});
                    console.error(err);
                })
            }
        })
    }
});

function checksumFile(hashName, path) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(hashName);
        const stream = fs.createReadStream(path);
        stream.on('error', err => reject(err));
        stream.on('data', chunk => hash.update(chunk));
        stream.on('end', () => resolve(hash.digest('hex')));
    });
}

module.exports = router;