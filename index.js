'use strict';

let Promise = require('bluebird');
let fs = require('fs');
let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');
let app = express();

const GPIO_PATH='/gpio';

Promise.promisifyAll(fs);

fs.writeFileAsync(path.join(GPIO_PATH, 'export'), '')
    .then(() => {
        console.log('Watching export file');
        fs.watch(path.join(GPIO_PATH, 'export'), (event, file) => {
            if (event === 'change') {
                fs.readFileAsync(file)
                    .tap(id => fs.mkdirAsync(path.join(GPIO_PATH, `gpio${id}`)))
                    .tap(function waitForAccess(id) {
                        return fs.accessAsync(path.join(GPIO_PATH, `gpio${id}`, 'direction'))
                            .catch(() => Promise.delay(500).then(() => waitForAccess(id)))
                    })
            }
        })
    });

app.get('/out/:id', function (req, res) {
    let id = req.params.id;
    fs.readFileAsync(path.join(GPIO_PATH, `gpio${id}`, 'value'))
        .then(Number)
        .then(value => res.json(value))
        .catch(() => res.status(500).send())
});

app.listen(4500, function () {
    console.log('Example app listening on port 4500!')
});
