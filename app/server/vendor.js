/* ************************************************************************
*  <copyright file="vendor.js" hyting>
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

const util = require('util');
const utils = require('./utils');
const urlParser = require('url');
const requestModule = require('request');

let serverConfigs = null;

const log4js = require('log4js');
log4js.configure({
    appenders: [{
        'type': 'dateFile',
        'filename': '/data/nodelog/log',
        'pattern': '-yyyy-MM-dd.log',
        'alwaysIncludePattern': true,
        'category': 'request'
    }]
});

const logger = log4js.getLogger('request');

const createOptions = (request, path, method, postData, isJson) => {
    logger.info(path, method, JSON.stringify(postData));
    return {
        uri: path,
        method: method,
        json: (isJson && postData) || null,
        // headers: request.headers,
        // useQuerystring: true,
        headers: {
            'accept': 'application/json,application/x.orion.v1+json'
        },
        body: (isJson && postData) ? postData : null,
        form: (!isJson && postData) ? postData : null
    };
};

const run = (error, res, body, responseHandler) => {
    logger.info(JSON.stringify(error), JSON.stringify(body));
    try {
        const successHandler = Array.isArray(responseHandler) ? responseHandler[0] : responseHandler.json;
        if (error || res.statusCode != serverConfigs.successResponseStatusCode) {
            throw new Error('bad response');
        }

        const responseData = typeof body == 'object' ?  body : JSON.parse(body);
        if (responseData.result_code != 'success') {
            throw new Error('bad response');
        }

        return successHandler({
            successful: true,
            rawStatusCode: res.statusCode,
            data: responseData.data
        });
    } catch (exception) {
        const failHandler = Array.isArray(responseHandler) ? responseHandler[1] : responseHandler.json;
        const errorStatusCode = (res && res.statusCode) ? res.statusCode : 'unknown';
        return failHandler({
            successful: false,
            rawStatusCode: errorStatusCode,
            message: util.format('invalid response with status %s from backend', errorStatusCode)
        });
    }
};

exports.init = configs => (serverConfigs = configs);

exports.success = (response, data) => (response.json({
    successful: true,
    rawStatusCode: serverConfigs.successResponseStatusCode,
    data: data
}));

exports.invalidResponse = response => response.send({
    successful: false,
    rawStatusCode: serverConfigs.invalidResponseStatusCode,
    message: 'Invalid http request, invalid path or missing required parameters!'
});

exports.promise = (request, path, method, resolve, reject, postData) => requestModule(createOptions(request, serverConfigs.apiHost + path, method, postData, true), (error, res, body) => run(error, res, body, [resolve, reject]));
