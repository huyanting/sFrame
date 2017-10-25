/* ************************************************************************
*  <copyright file="worldMap_middleware.js" company="hyting>
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

const util = require('util');
const utils = require('../utils');

exports.register = (app, serverConfigs, express) => {
    app.use('/worldMap', (request, response) => {
        response.render('index', {
            viewName: 'worldMap'
        });
    });
};
