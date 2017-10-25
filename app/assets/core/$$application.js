/* ************************************************************************
*  <copyright file="$$application.js" hyting>
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

let $count = 0;
window.$userInfo = {
    app_id: 10086,
    app_ver: '9.9.9'
};

$context.init = (callback, forceLogin = true) => {
    if ($context.isPreviewMode) {
        window.$environment = $utils.getUrlParam('environment') || 'ios';
        /* eslint-disable camelcase  */
        $userInfo = {
            app_id: $utils.getUrlParam('app_id') || 10002,
            app_ver: $utils.getUrlParam('app_ver') || '1.4.5',
            access_token: $utils.getUrlParam('access_token') || 'ASDFGHJK',
            mobile: $utils.getUrlParam('mobile') || '13810662962'
        };
        // 若为预览页增加覆盖层不可点击
        $('body').append('<div class="preview-cover"></div>');
        /* eslint-enable camelcase */
        return callback && callback($userInfo);
    }

    window.$environment = 'sharingPage';
    if (typeof getJsBridge == 'undefined') {
        if ($count > 10) {
            return (callback && callback($userInfo));
        }

        $count++;
        setTimeout(() => $context.init(callback), 10);
        return;
    }

    $utils.getJsBridge('getLoginInfo', {}, responseData => {
        $userInfo = responseData;
        if (($userInfo.app_id || {}).indexOf('10001') == 0) {
            window.$environment = 'android';
        } else if (($userInfo.app_id || {}).indexOf('10002') == 0) {
            window.$environment = 'ios';
        }

        if (!$userInfo.access_token && forceLogin) {
            $(document).on('visibilitychange', event => {
                if (event.currentTarget.visibilityState != 'hidden') {
                    $utils.getJsBridge('getLoginInfo', {}, userInfo => {
                        if (!userInfo.access_token) {
                            $utils.getJsBridge('closePage', {});
                        }
                    });
                }
            });
            // if ($userInfo.app_id == 10002) {
            //     $utils.getJsBridge('closePage', {});
            // }
            return $utils.getJsBridge('redirectToLoginView');
        }

        if ($userInfo.app_ver < '1.3.6') {
            // 此处添加提示升级逻辑，版本号可能需要调整
        }

        callback && callback($userInfo);
    });
};

$context.isPreviewMode = $utils.getUrlParam('preview') == 'true';
