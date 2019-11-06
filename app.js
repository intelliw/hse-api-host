//@ts-check
'use strict';
/**
 * version 00.08
 */

const express = require('express');
const bodyParser = require('body-parser')
const Buffer = require('safe-buffer').Buffer;

const paths = require('./src/paths');
const env = require('./src/environment');
const enums = env.enums;

const host = require('./src/host');
const consts = host.consts;

const log = require('./src/logger').log;

const GenericMessage = require('./src/definitions/GenericMessage');
const GenericMessageDetail = require('./src/definitions/GenericMessageDetail');

// [START setup]------------------------------
const app = express();

// initialise 
host.configs.initialise(app);                                                            // configuration settings

/* body parser
 * use  verify function to get raw body - bodyParser.raw applies only if bodyParser.json fails due to incorrect content-type header
 * this allows us to check if body is empty when validating the content-type header in ContentType constructor   */
var rawBodySaver = function (req, res, buf, encoding) {
    // if (buf && buf.length) { req.rawBody = buf.toString(encoding || 'utf8');}
}
app.use(bodyParser.json({ verify: rawBodySaver, limit: `${consts.system.BODYPARSER_LIMIT_MB}mb` }));
app.use(bodyParser.raw({ verify: rawBodySaver, limit: `${consts.system.BODYPARSER_LIMIT_MB}mb`, type: function () { return true } }));   // for raw body parse function must return true

// routes        
app.use('/energy', paths.energyRouter);                                                 // openapi tag: Energy - this is als to the default route

// app.use(['/devices', '/device'], paths.devicesRouter);                               // openapi tag: Devices
app.use('/devices', paths.devicesRouter);                                               // openapi tag: Devices
app.use('/device', paths.deviceRouter);                                                 // openapi tag: Devices

app.use('/api', paths.apiRouter);                                                       // openapi tag: DevOps
app.use('/static', express.static(consts.folders.STATIC));                              // static folders 

// log errors - error handler 
app.use((err, req, res, next) => {
    const statusCode = 500;
    const status = enums.responseStatus[statusCode];
    
    if (!err.statusCode) err.statusCode = statusCode;
    next(err);

    if (err) {
        log.error(log.enums.labels.unexpected, err);
    } else {
        log.exception(log.enums.labels.unexpected, status, log.ERR.event());
    }

});

// catch all - error handler 
app.use((err, req, res, next) => {

    const statusCode = 500;
    const status = enums.responseStatus[statusCode];
    
    if (res.headersSent) return next(err);

    res.status(statusCode)

    let responseDetail = new GenericMessageDetail();
    responseDetail.add(err.message, err.stack);

    let response = new GenericMessage(statusCode, status, responseDetail.getElements());
    res.json(response.getElements());

});

// express error handling middleware should be attached after all the other routes and use() calls. See the Express.js docs.  https://cloud.google.com/error-reporting/docs/setup/nodejs
// app.use(log.ERR.express);

// [END setup]-----------------------------------



// listen for requests---------------------------
if (module === require.main) {

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(`App listening (inside container) on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
    });
}
// --------------------------------------------

