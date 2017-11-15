/* ************************************************************************
*  <copyright file="index.js" company="hyting">
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

const fs = require('fs');
const util = require('util');
const path = require('path');
const Hjson = require('hjson');
const express = require('express');
const compress = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(compress());
app.use(cookieParser());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

const templatePath = path.join(__dirname, './views');
app.set('view engine', 'ejs');
app.set('views', templatePath);

if (process.env.NODE_ENV && process.env.NODE_ENV != 'dev') {
    app.enable('view cache');
}

const encoding = 'utf8';
const serverCommonConfigs = Hjson.parse(fs.readFileSync(path.join(__dirname, './server/configs/server_common_configs.json'), encoding));
const serverExtendConfigs = Hjson.parse(fs.readFileSync(path.join(__dirname, './server/configs/server_extend_configs.' + (process.env.NODE_ENV || 'dev') + '.json'), encoding));
const serverConfigs = Object.assign({}, serverCommonConfigs, serverExtendConfigs);

const vendor = require('./server/vendor');
vendor.init(serverConfigs);

// please note the order of middlewares is very IMPORTANT! Never mess it up unless you know clearly what you are doing.
['demo', 'api', 'template', 'static', 'default'].forEach(middleware => require(util.format('./server/express_middlewares/%s_middleware', middleware)).register(app, serverConfigs, express));

app.listen(process.env.NODE_PORT || serverConfigs.port);
