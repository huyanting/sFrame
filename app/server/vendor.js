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

exports.hostMapping = {
    'app-dev.': 'app-dev-dl.',
    'app-test.': 'app-test-dl.',
    'app-staging.': 'app-stg-dl.',
    'app-stg.': 'app-stg-dl.',
    'app.': 'app-dl.'
};

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

// exports.manage = (request, response, url, method, postData, contentType) => requestModule(createOptions(request, url, method, postData, contentType == 'json'), (error, res, body) => run(error, res, body, response));

exports.promise = (request, path, method, resolve, reject, postData) => requestModule(createOptions(request, serverConfigs.apiHost + path, method, postData, true), (error, res, body) => run(error, res, body, [resolve, reject]));

exports.renderCollection = (resources, request) => {
    const deviceInfo = utils.getDeviceInfo(request.headers['user-agent']);
    let retResources = [];
    if (resources && Array.isArray(resources)) {
        for (const resItem of resources) {
            const resItemObj = {};
            const content = resItem[resItem.resource_type];
            let shareUrl = content.share_url;
            resItemObj.coverImage = content.cover_image;
            resItemObj.title = content.title;
            resItemObj.description = content.description;
            if (content.flow_label) {
                // 信息头图角标文案or图片
                resItemObj.flowLabel = {};
                for (const key in content.flow_label) {
                    const obj = content.flow_label[key];
                    resItemObj.flowLabel[key] = (obj.url || obj.text) ? {} : null;
                    if (obj.url) {
                        resItemObj.flowLabel[key].url = obj.url;
                    }
                    if (obj.text) {
                        resItemObj.flowLabel[key].text = obj.text;
                    }
                }
            }
            if (content.publish_time) {
                const second = 1000;
                const minute = 60 * second;
                const hour = 60 * minute;
                const day = 24 * hour;

                // 底部时间戳
                let preItemTime = new Date().getTime() - content.publish_time * second;
                if (preItemTime <= minute) {
                    preItemTime = '刚刚';
                } else if (preItemTime > minute && preItemTime <= hour) {
                    preItemTime = (parseInt(preItemTime / minute) + '分钟前');
                } else if (preItemTime > hour && preItemTime <= day && new Date(content.publish_time * second).getDate() == new Date().getDate()) {
                    //未超过24小时，且未隔夜显示小时
                    preItemTime = (parseInt(preItemTime / hour) + '小时前');
                } else if (new Date(content.publish_time * second).getFullYear() == new Date().getFullYear()) {
                    //一年内
                    preItemTime = utils.formatDate(new Date(second * content.publish_time), 'MM-dd hh:mm');
                } else {
                    //年限不同
                    preItemTime = utils.formatDate(new Date(second * content.publish_time), 'yyyy-MM-dd hh:mm');
                }
                resItemObj.publishTime = preItemTime;
                resItemObj.viewCount = content.view_count;
                // 根据手机区分点击打开连接
                if (deviceInfo.type == 'ios') {
                    // 若为ios替换掉host
                    shareUrl = urlParser.parse(shareUrl);
                    const shareUrlPath = shareUrl.path;
                    const shareHost = shareUrl.host;
                    for (const key in exports.hostMapping) {
                        if (shareHost.startsWith(key)) {
                            shareUrl = 'https://yantinghu.com';
                            // 未设置白名单可见及未设置版本过滤的可跳入文章页，否则只进入首页
                            if ((!content.white_list || (content.white_list && content.white_list[0] && content.white_list[0].type && content.white_list[0].type == 'all')) && !content.filter_cond) {
                                shareUrl += shareUrlPath;
                            }
                            break;
                        }
                    }
                }

                resItemObj.shareUrl = shareUrl;
            }// end publish_time if
            retResources.push(resItemObj);
        }// end resources foreach
    }
    return retResources;
};
