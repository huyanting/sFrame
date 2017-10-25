/* ************************************************************************
*  <copyright file="api_middleware.js" hyting>
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

// 此中间件用于向api server转发开发环境的get/post请求，测试和线上环境会通过nginx进行反向代理，不再经过本中间件。不要在以下代码中添加任何业务逻辑
const requestModule = require('request');

exports.register = (app, serverConfigs, express) => {
    app.get('/api/*', (request, response) => {
        requestModule({
            url: serverConfigs.apiHost + request.url,
            headers: {
                authorization: request.headers.authorization
            }
        }).on('error', error => {
            response.send({
                result_code: 'timeout',
                message: error,
                server_time: Math.floor((new Date()).getTime() / 1000)
            });
        }).pipe(response);
    });

    app.post('/api/*', (request, response) => {
        requestModule({
            method: 'post',
            url: serverConfigs.apiHost + request.url,
            headers: {
                authorization: request.headers.authorization
            },
            form: request.body
        }).on('error', error => {
            response.send({
                result_code: 'timeout',
                message: error,
                server_time: Math.floor((new Date()).getTime() / 1000)
            });
        }).pipe(response);
    });
};
