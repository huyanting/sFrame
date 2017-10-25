/* ************************************************************************
*  <copyright file="default_middleware.js" hyting>
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

exports.register = app => {
    // 统一异常处理
    app.use((error, request, response, next) => {
        if (process.env.NODE_ENV != 'prod') {
            console.log(error);
            response.status(500).send({
                message: error
            });
        } else {
            response.status(500).send({
                message: 'internal error'
            });
        }
    });
};

