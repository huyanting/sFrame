/* ************************************************************************
 *  <copyright file="$$utils.js" hyting>
 *  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

// 忽略不要向window对象挂载变量
/// #[IGNORE:NEVER_MOUNT_TO_WINDOW]

const underscore = require('underscore');

$context.getContentId = pathname => {
    let contentId = '';
    const matchRes = pathname.match(/^\/(content|event|mall\/item)\/([0-9]+)\??/);
    if (matchRes && matchRes.length > 2) {
        contentId = matchRes[2];
    }
    return contentId;
};

$context.getUrlParam = name => {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    const r = location.search.substr(1).match(reg);

    if (r != null) {
        return unescape(r[2]);
    }

    return null;
};

// 对话框输出
$context.alert = info => {
    window.closeAlert = event => {
        if (event && event.currentTarget && event.currentTarget.parentNode) {
            event.currentTarget.parentNode.parentNode.remove();
        }
    };
    if (typeof info == 'object') {
        info = JSON.stringify(info);
    }
    if (typeof info == 'string') {
        info = info.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/</g, '&gt;').replace(/ /g, '&nbsp;').replace(/"/g, '&quot;');
    }

    const infoTemplate = `
        <div class="h5-alert">
            <div class="h5-alert-modal">
                <div class="h5am-info">${info}</div>
                <div class="h5am-btn" onClick="closeAlert(event)">确认</div>
            </div>
            <div class="h5-alert-bg"></div>
        </div>
    `;

    $('body').append(infoTemplate);
};

$context.ajax = ({
    url,
    isProxy = false,
    method = $commonConfigs.httpRequestMethod.get,
    postData = null,
    extendHeader = {},
    errorHandler = null,
    errorMessage = null,
    previewHandler = null
} = {}) => new Promise((resolve, reject) => $.ajax({
    headers: Object.assign({
        Authorization: ('Bearer ' + (($userInfo || {}).access_token || '')).trim()
    }, extendHeader),
    type: method,
    url: url,
    data: postData,
    success: responseData => {
        // 纯代理或者转发模式直接返回请求结果
        if (isProxy) {
            return resolve(responseData);
        }
        if (responseData.result_code != 'success') {
            if ($context.getUrlParam('preview') == 'true' && previewHandler) {
                return resolve(previewHandler());
            }
            return errorHandler ? errorHandler(responseData.result_code) : reject(errorMessage || responseData.result_code);
        }

        resolve(responseData.data);
    },
    error: () => errorHandler ? errorHandler() : reject(errorMessage || '发生错误，请刷新页面重试！')
}));

const provincesAndCities = [11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 33, 34, 35, 36, 37, 41, 42, 43, 44, 45, 46, 50, 51, 52, 53, 54, 61, 62, 63, 64, 65, 71, 81, 82, 91];

const validateAddressCode = addressCode => (/^[1-9]\d{5}$/.test(addressCode) && (provincesAndCities.indexOf(addressCode.substring(0, 2) - 0) >= 0));

const validateBirthdayCode = birthdayCode => {
    if (!(/^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(birthdayCode))) {
        return false;
    }

    const yyyy = birthdayCode.substring(0, 4);
    const mm = birthdayCode.substring(4, 6);
    const dd = birthdayCode.substring(6);
    const xdata = new Date(yyyy, mm - 1, dd);
    return (xdata < new Date()) && (xdata.getFullYear() == yyyy) && (xdata.getMonth() == mm - 1) && (xdata.getDate() == dd);
};

const powers = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const parityBit = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];

const validateParityBit = idNumber => {
    const prefix = idNumber.substring(0, 17);
    let power = 0;
    for (let i = 0; i < 17; i++) {
        power += prefix[i] * powers[i];
    }

    return parityBit[power % 11] == idNumber[17].toUpperCase();
};

// 校验15位的身份证号码
const validateIdCard15 = idNumber => (/^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idNumber)) && validateAddressCode(idNumber.substring(0, 6)) && validateBirthdayCode('19' + idNumber.substring(6, 12));

// 校验18位的身份证号码
const validateIdCard18 = idNumber => (/^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(idNumber)) && validateAddressCode(idNumber.substring(0, 6)) && validateBirthdayCode(idNumber.substring(6, 14)) && validateParityBit(idNumber);

// 15位和18位身份证号码的基本校验
$context.validateIdCard = idNumber => {
    if (!(/^\d{15}|(\d{17}(\d|x|X))$/.test(idNumber))) {
        return false;
    }

    // 判断长度为15位或18位
    if (idNumber.length == 15) {
        return validateIdCard15(idNumber);
    } else if (idNumber.length == 18) {
        return validateIdCard18(idNumber);
    } else {
        return false;
    }
};

// 验证护照
$context.validatePassport = passport => {
    if (!passport) {
        return false;
    }
    return /^[a-zA-Z0-9]{5,17}$/.test(passport);
};

$context.closeView = () => $context.getJsBridge('closePage');

$context.deepCopy = source => {
    const result = {};
    for (const key in source) {
        result[key] = typeof source[key] === 'object' ? $context.deepCopy(source[key]) : source[key];
    }
    return result;
};

$context.formValidate = (formItems, selectedData) => {
    let errorInfo = null;
    const configs = formItems;

    for (let i = 0; i < configs.length; i++) {
        const id = configs[i].field_id;
        $('#' + id).removeClass('item-error');
        errorInfo = {
            id: id,
            type: configs[i].type,
            message: ''
        };

        if (configs[i].type == 'select' && configs[i].required && !selectedData[id]) {
            errorInfo.message = '请选择' + configs[i].alias;
            break;
        }
        if (configs[i].type == 'input' && configs[i].required && selectedData[configs[i].field_id] == '') {
            errorInfo.message = '请输入' + configs[i].alias;
            break;
        }
        if (configs[i].field_id == 'mobile' && !selectedData[configs[i].field_id].match(/^98762\d{6}$/) && !selectedData[configs[i].field_id].match(/^1[3578]\d{9}$/)) {
            errorInfo.message = '请输入正确的手机号码！';
            break;
        }
        if (configs[i].field_id == 'personal_height' && !selectedData[configs[i].field_id].match(/^\d+(\.\d+)?$/)) {
            errorInfo.message = configs[i].alias + '要求为数字';
            break;
        }

        if (configs[i].field_id == 'identity_card') {
            const isValide = !selectedData.card_type || selectedData.card_type.id == 0 ? $context.validateIdCard(selectedData[configs[i].field_id]) : $context.validatePassport(selectedData[configs[i].field_id]);
            if (!isValide) {
                errorInfo.message = configs[i].alias + '格式不匹配';
                break;
            }
        }
    }

    if (errorInfo && errorInfo.message) {
        $('#' + errorInfo.id).addClass('item-error');
        return errorInfo;
    }

    return null;
};

$context.getYYYYMMDD = date => {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let thisDate = date.getDate();

    month = month > 9 ? month : ('0' + month);
    thisDate = thisDate > 9 ? thisDate : ('0' + thisDate);
    return year + '年' + month + '月' + thisDate + '日';
};

$context.formatDate = (date, format) => {
    const mapping = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds() // 毫秒
    };

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for (const key in mapping) {
        if (new RegExp('(' + key + ')').test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (mapping[key]) : (('00' + mapping[key]).substr(('' + mapping[key]).length)));
        }
    }

    return format;
};

$context.renderTemplate = (template, $node, data) => $node.html(underscore.template(template)(data || {}));

$context.renderVendor = (templateData, renderData) => {
    if (templateData.resource.hotFixGotoView) {
        eval(templateData.resource.hotFixGotoView);
    }

    renderData.body && $context.renderTemplate(renderData.template, $('#container'), renderData.body);
    $('body').css({ 'backgroundImage': renderData.bodyBackgroundImg ? 'url(' + renderData.bodyBackgroundImg + ')' : 'none' });
    $('body').attr('view-name', renderData.moduleName);

    if (templateData.resource.hotFixAfterGotoView) {
        eval(templateData.resource.hotFixAfterGotoView);
    }
};

$context.renderModalVender = (templateData, renderData) => {
    if (templateData.resource.hotFixGotoView) {
        eval(templateData.resource.hotFixGotoView);
    }

    renderData.body && $context.renderTemplate(renderData.template, $('#modal'), renderData.body);

    if (templateData.resource.hotFixAfterGotoView) {
        eval(templateData.resource.hotFixAfterGotoView);
    }
};

/* eslint-disable no-console */
$context.getJsBridge = (name, params = {}, callback = null) => {
    if (typeof getJsBridge == 'undefined') {
        DEBUG && name == 'showToast' && console.log(params.content);
        $('.download-link').length && $('.download-link').click();
    } else {
        if (name == 'showToast' && typeof params.content != 'string') {
            if (DEBUG) {
                params.content = JSON.stringify(params.content);
            } else {
                return;
            }
        }

        getJsBridge().call(name, params, responseText => {
            if (!callback) {
                return;
            }

            try {
                callback(JSON.parse(responseText));
            } catch (error) {
                DEBUG && console.error(error);
                callback({});
            }
        });
    }
};
/* eslint-enable no-console */
