/* ************************************************************************
*  <copyright file="static_middleware.js" hyting>
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

// 定义静态资源中间件，build中存放编译好的js/css文件，static中存放页面静态图片资源，使用/static/作为pattern
const path = require('path');
const buildPath = path.join(__dirname, '../../dist');

exports.register = (app, serverConfigs, express) => {
    // consul-agent 心跳检测
    app.use('/status', (request, response) => {
        response.send({
            message: 'running...',
            status: 'ok'
        });
    });

    [buildPath].forEach(path => app.use(/\/*\/dist/, express.static(path, {
        redirect: false,
        maxAge: path.endsWith('html') ? 0 : 365 * 86400000 // 365 days
    })));
};
