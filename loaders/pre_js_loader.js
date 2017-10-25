/* ************************************************************************
*  <copyright file="pre_js_loader.js" hyting>
*  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
*
*  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
*  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
*  PARTICULAR PURPOSE.
*  </copyright>
*  ***********************************************************************/

// 用来检查不允许在模块代码中出现的模式，ignoreAttribute为忽略当前语法模式检查的特性声明

'use strict'

const sensitive_words = {
    '^(?!(\\/\\*\\s(\\*){72}((\\r)?\\n){1}))': {
        errorMessage: '每个代码模块要添加固定文件头！',
        ignoreAttribute: '/// #[IGNORE:MUST_HAVE_FIXED_HEADER]'
    },
    '\\*(\\s){2}(\\*){71}/(?!(((\\r)?\\n){2}))': {
        errorMessage: '文件头与模块代码之间需要添加一行空白！',
        ignoreAttribute: '#[IGNORE:MUST_HAVE_EMPTY_LINE]'
    },
    '\\$\\$baseModule': {
        errorMessage: '请不要在代码中显式引用$$baseModule模块！',
        ignoreAttribute: '/// #[IGNORE:NEVER_REFERENCE_TO_$BASEMODULE]'
    },
    '\\$context\\s=\\s': {
        errorMessage: '请不要重定义$context对象！',
        ignoreAttribute: '/// #[IGNORE:NEVER_ASSIGN_TO_$CONTEXT]'
    },
    '[\\W](!@)module[\\s,;]': {
        errorMessage: '请不要使用\'module\'命名变量，使用\'moduleObject来代替\'！',
        ignoreAttribute: '/// #[IGNORE:NEVER_NAME_VARIABLE_AS_MODULE]'
    },
    'module\\.exports\\s=\\s': {
        errorMessage: '请不要自定义exports内容，把所有需要导出的数据绑定到$context！',
        ignoreAttribute: '/// #[IGNORE:NEVER_ASSIGN_TO_EXPORTS]'
    },
    'exports\\.\\w+\\s=\\s': {
        errorMessage: '请不要自定义exports内容，把所有需要导出的数据绑定到$context！',
        ignoreAttribute: '/// #[IGNORE:NEVER_ASSIGN_TO_EXPORTS]'
    },
    'window\\.\\w+\\s=\\s': {
        errorMessage: '请不要在模块代码中将表达式或者变量挂载到window对象！',
        ignoreAttribute: '/// #[IGNORE:NEVER_MOUNT_TO_WINDOW]'
    },
    'document\\.\\w+\\s=\\s': {
        errorMessage: '请不要在模块代码中将表达式或者变量挂载到document对象！',
        ignoreAttribute: '/// #[IGNORE:NEVER_MOUNT_TO_DOCUMENT]'
    },
};

const fs = require('fs');
const path = require('path');
const previous_snippet = fs.readFileSync(path.join(__dirname, './prefix_snippet'), 'utf-8');
const suffix_snippet = fs.readFileSync(path.join(__dirname, './suffix_snippet'), 'utf-8');

module.exports = function(sourceCode, map) {
    const fileSource = path.parse(this.resourcePath);
    const fileName = fileSource.base.replace('.', '\\.');
 
    // TODO
    // 统一正则判断方法
    
    // let name = '^((?!file="' + fileName + '").)*$';
    // let name = '^((?!file).)*$';
    // console.log(name, sourceCode.match(new RegExp(name)));
    // sensitive_words[name] = {
    //     errorMessage: '每个代码模块文件头应包含正确的文件名',
    //     ignoreAttribute: '#[IGNORE:MUST_HAVE_SAME_FILE_NAME]'
    // };
    let fileNameReg = 'copyright file="(.*).js" hyting>';
    let name = sourceCode.match(new RegExp(fileNameReg));
    
    if (!name || name[1] !== fileSource.name) {
        this.emitError('每个代码模块文件头应包含正确的文件名');
    }

    for (const word in sensitive_words) {
        let content = sensitive_words[word];
        let shouldIgnore = sourceCode.includes(content.ignoreAttribute);

        if (sourceCode.match(new RegExp(word)) && !shouldIgnore) {
            this.emitError(content.errorMessage);
        }

        if (shouldIgnore) {
            sourceCode = sourceCode.replace(content.ignoreAttribute, '');
        }
    }

    // delete sensitive_words[name];

    sourceCode = '$context.$moduleName = \'' + fileSource.name + '\';\n' + sourceCode;
    return this.callback(null, previous_snippet + '\n' + sourceCode + '\n' + suffix_snippet, map);
};
