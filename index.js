'use strict';

let Promise = require('bluebird');
let fs = require('fs');
let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');
let app = express();

const GPIO_PATH='/gpio';

let ignoreFileExists = err => {
    if (err.code !== 'EEXIST') {
        throw err;
    }
};

Promise.promisifyAll(fs);

app.get('/out/:id', function (req, res) {
    let id = req.params.id;
    fs.readFileAsync(path.join(GPIO_PATH, `gpio${id}`, 'value'))
        .then(Number)
        .then(value => res.json(value))
        .catch(() => res.status(500).send())
});

app.get('/health', function (req, res) {
    res.send()
});

fs.writeFileAsync(path.join(GPIO_PATH, 'export'), '')
    .then(() => {
        console.log('Watching export file');
        fs.watch(path.join(GPIO_PATH, 'export'), (event, file) => {
            if (event === 'change') {
                fs.readFileAsync(path.join(GPIO_PATH, file), 'utf-8')
                    .then(data => parseInt(data.trim()))
                    .tap(id => fs.mkdirAsync(path.join(GPIO_PATH, `_gpio${id}`)).catch(ignoreFileExists))
                    .tap(id => fs.writeFileAsync(path.join(GPIO_PATH, `_gpio${id}`, 'value'), '0'))
                    .tap(id => fs.renameAsync(path.join(GPIO_PATH, `_gpio${id}`), path.join(GPIO_PATH, `gpio${id}`)))
            }
        });

        app.listen(4500, function () {
            console.log('Example app listening on port 4500!')
        });
    });
