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
        fs.watch(path.join(GPIO_PATH, 'export'), (event, file) => {
            if (event === 'change') {
                fs.readFileAsync(file)
                    .tap(value => fs.mkdirAsync(path.join(GPIO_PATH, `gpio${value}`)))
                    .tap(function waitForAccess(value) {
                        return fs.accessAsync(path.join(GPIO_PATH, `gpio${value}`, 'direction'))
                            .catch(() => Promise.delay(500).then(() => waitForAccess(value)))
                    })
            }
        })
    });

app.post('/led', function (req, res) {
    let value = req.body.value;
    console.log(value);
    res.send();
});

app.listen(4500, function () {
    console.log('Example app listening on port 3000!')
});
