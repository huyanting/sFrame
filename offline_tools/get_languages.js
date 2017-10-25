var mysql = require('mysql');
var fs = require('fs');
var connection = mysql.createConnection({
    host     : '10.60.81.188',
    user     : 'root',
    password : '123456',
    database : 'lh_alpha'
});

var basePath = './app/server/i18n';
var lans = {
        'zh-cn': {},
        'zh-tw': {},
        'en-us': {},
        'ja': {},
        'kr': {}
    };

/**
 * [writeConfig description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 *
 *  {
        id: 103,
        key: 'KEY_HEALTHY',
        'zh-cn': '广告运行良好',
        'zh-tw': '',
        'en-us': 'Running Well',
        ja: '',
        record_time: Tue Jul 05 2016 14:53:51 GMT+0800 (CST),
        type: 1,
        desc: ''
 *  }
 */
const writeConfig = data => {
    var server = {};
    var client = {};
    for (var lan in lans) {
        server[lan] = {};
        client[lan] = {};
    }

    for (var i = 0; i < data.length; i ++) {
        var record = data[i];
        if ((record.type & 2) == 2) { // server端语言包
            for (var lan in lans) {
                server[lan][record.key] = record[lan] || '';
                server[lan][record.key] = server[lan][record.key].replace(/\'/g, '\\\'');
            }
        }
        if ((record.type & 1) == 1) { // client端语言包
            for (var lan in lans) {
                client[lan][record.key] = record[lan] || '';
                client[lan][record.key] = client[lan][record.key];
            }
        }
    }

    for (var lan in lans) {
        var serverPath = basePath + '/server/';
        var clientPath = basePath + '/client/';
        fs.writeFile(serverPath + lan + '.json', JSON.stringify(server[lan]), 'utf8', error => {
            error && console.log(error);
        });

        fs.writeFile(clientPath + lan + '.json', JSON.stringify(client[lan]), 'utf8', error => {
            error && console.log(error);
        });
    }


    fs.writeFile(basePath + '/sql.json', JSON.stringify(data), 'utf8', error => {
        error && console.log(error);
    });
}


connection.connect();

connection.query('SELECT * from lh_dict_i18n;', (err, rows, fields) => {
    if (err) throw err;
    writeConfig(rows);
});

connection.end();
