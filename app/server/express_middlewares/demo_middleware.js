/* ************************************************************************
*  <copyright file="demo_middleware.js" hyting>
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

// 提供demo数据，使用/demo/作为pattern

exports.register = app => {
    app.use('/demo', (request, response) => {
        const data = {
            a: 1,
            b: 2,
            c: 3
        };

        response.send({
            successful: true,
            data: data
        });
    });
};
