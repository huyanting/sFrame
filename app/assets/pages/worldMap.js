/* ************************************************************************
*  <copyright file="worldMap.js" hyting>
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

require('./worldMap.scss');
const json = require('./world.json');
const echarts = require('echarts');

const option = {
    tooltip: {
        trigger: 'item',
        formatter: '{b}'
    },
    geo: [
        {
            name: '世界地图',
            type: 'map',
            map: 'world',
            roam: true,
            selectedMode: 'single',
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true
                    }
                }
            }
        }
    ],
    series: [{
        type: 'map',
        map: 'world'
    }]
};

echarts.registerMap('world', json);
const map = echarts.init($('#map')[0]);
map.setOption(option);
