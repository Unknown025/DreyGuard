const path = require('path');
const mongoose = require('mongoose');
const Update = mongoose.model('Update');
const express = require('express');
const router = express.Router();

router.use('/releases', express.static(path.join(__dirname, 'releases')));

router.get('/latest', function (req, res) {
    const latest = getLatestRelease();
    const clientVersion = req.query.v;

    if (clientVersion === latest) {
        res.status(204).end();
    } else {
        res.json({
            url: `${this.origin}/releases/darwin/${latest}/app.zip`
        });
    }
});

router.get('/darwin/:version/releases', function (req, res) {
    const latest = getLatestRelease(req.params.platform, req.query.id);
    const clientVersion = req.query.localversion;

    if (!latest) {
        return res.status(204);
    }

    if (clientVersion === latest) {
        res.status(204).end();
    } else {
        res.json({
            url: `${req.hostname}/releases/win32/${latest}/app.zip`,
            pub_date: latest.pubDate.toISOString(),
            notes: latest.notes,
            name: latest.name
        });
    }
});

// http://localhost:3000/update/win32/x64/1.0.0/releases?id=andai-launcher&localversion=1.0.0&arch=amd64
router.get('/win32/:arch/:name/releases', function (req, res) {
    Update.find({platform: 'win32', arch: req.params.arch, forId: req.params.name.toLowerCase()}).sort({
        major: -1,
        minor: -1,
        patch: -1
    }).then((updates) => {
        if (!updates || updates.length < 1) {
            return res.status(500).end();
        }
        res.set('Content-Type', 'text/plain');
        let response = "";
        updates.forEach(function(update) {
            update.files.forEach(function(value) {
                response += `${value.hash} ${value.filename} ${value.size}\n`
            });
        });
        res.send(response).end();
    })
});

router.get('/win32/:arch/:name/:download', function (req, res) {
    const file = path.resolve('./releases/' + req.params.name + '/win32/' + req.params.arch + '/' + req.params.download);
    // latest.downloads = latest.downloads + 1;
    // Update.updateOne({_id: latest.id}, {$set: latest});
    res.sendFile(file, path.basename(file));
});

async function getLatestRelease(platform, arch, forId) {
    return await Update.find({platform: platform, arch: arch, forId: forId}).sort({
        major: -1,
        minor: -1,
        patch: -1
    }).exec();
}

module.exports = router;