/* ************************************************************************
*  <copyright file="template_middleware.js" hyting>
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
const vendor = require('../vendor');
const version = require('../../version.json').version;
const defaultUserIcon = '/dist/imgs/sign_in_fill_in_information_no_add_picture_icon.png';

const androidDownloadLink = 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.com.weilaihui3';
const iosDownloadLink = 'https://itunes.apple.com/cn/app/wei-lai/id1116095987?mt=8';

const createComments = (commentCount, rawComments) => rawComments.map(rawComment => {
    const comment = {
        img: (rawComment.profile || {}).head_image || defaultUserIcon,
        name: (rawComment.profile || {}).name || '游客',
        comment: rawComment.comment,
        likeCount: rawComment.like_count || 0,
        replies: []
    };

    if (rawComment.replies) {
        comment.replies = rawComment.replies.map(reply => ({
            img: (reply.profile || {}).head_image || defaultUserIcon,
            name: (reply.profile || {}).name || '游客',
            replyToName: reply.reply_to_name || '游客',
            likeCount: reply.like_count || 0,
            comment: reply.comment
        }));
    }

    return comment;
});

exports.register = (app, serverConfigs, express) => {
    app.locals.version = version;

    app.get(/\/(event|content)\/([\d]+)/, (request, response) => {
        const userAgent = request.headers['user-agent'];
        const contentGroup = request.params[0];
        const contentId = request.params[1];
        const promises = [];
        /* eslint-disable no-underscore-dangle */
        promises.push(new Promise((resolve, reject) => vendor.promise(request, util.format('/api/1%s?app_id=10086&%s', request.path, request._parsedUrl.query), 'GET', resolve, reject)));
        if (request.query.preview != 'true') {
            promises.push(new Promise((resolve, reject) => vendor.promise(request, util.format('/api/1%s/comments?offset=0&count=5&app_id=10086&%s', request.path, request._parsedUrl.query), 'GET', resolve, reject)));
        }
        /* eslint-enable no-underscore-dangle */

        Promise.all(promises).then(responseArray => {
            const detailData = responseArray[0].data || {};
            const commentData = (responseArray[1] || {}).data || [];
            const shouldRenderHeadImage = ((detailData.native_style || {}).cover_head_image || {}).is_show;
            const shouldRenderTitle = ((detailData.native_style || {}).title || {}).is_show;
            const shouldRenderPublisher = ((detailData.native_style || {}).publisher || {}).is_show;
            const shouldRenderCommentZone = ((detailData.native_style || {}).comment_section || {}).is_show;
            const renderData = {
                title: detailData.title + ' - 蔚来',
                viewName: 'article',
                viewInfo: {
                    resourceId: contentId,
                    resourceType: contentGroup,
                    device: utils.getDeviceInfo(userAgent)
                },
                previewClass: request.query.preview ? 'preview' : '',
                headImage: (shouldRenderHeadImage || (shouldRenderHeadImage == null)) ? detailData.cover_image : null, // 此处是否应该使用cover_head_image?
                content: {
                    title: (shouldRenderTitle || (shouldRenderTitle == null)) ? detailData.title : null,
                    shouldRenderPublisher: (shouldRenderPublisher || (shouldRenderPublisher == null)),
                    pubImg: (detailData.profile || {}).head_image || defaultUserIcon,
                    pubName: (detailData.profile || {}).name || '无名氏',
                    pubTime: utils.formatDate(new Date(1000 * detailData.publish_time), 'yyyy-MM-dd'),
                    content: detailData.content,
                    viewCount: detailData.view_count || 0,
                    likeCount: detailData.like_count || 0
                },
                commentZone: ((shouldRenderCommentZone || shouldRenderCommentZone == null) && detailData.comment_count) ? { comments: createComments(detailData.comment_count, commentData), commentCount: detailData.comment_count || 0 } : null,
                bottomBannerContent: utils.createBottomBannerContent(request, detailData)
            };

            if (contentGroup == 'event') {
                renderData.event = {
                    location: detailData.location || '待定',
                    startTime: utils.formatDate(new Date(1000 * detailData.start_time), 'yyyy-MM-dd hh:mm'),
                    endTime: utils.formatDate(new Date(1000 * detailData.end_time), 'yyyy-MM-dd hh:mm'),
                    registrationFields: detailData.registration_fields
                };
            } else {
                switch (detailData.content_type) {
                case 'article':
                case 'h5_article':
                    break;
                case 'vote':
                    renderData.vote = {
                        voteQuestions: detailData.vote_questions || []
                    };
                    break;
                case 'livestream':{
                    renderData.viewName = 'livestream';
                    const liveStream = detailData.live_stream || {};
                    const liveStreamUrl = liveStream.url;
                    if (!liveStreamUrl) {
                        throw new Error('invalid livestream source');
                    }

                    const isH5VideoSupported = utils.isMobile(userAgent) || utils.isSafari(userAgent);
                    const neteaseSource = liveStream.netease;
                    const isVhall = !neteaseSource;
                    if (!isVhall) {
                        neteaseSource.liveSrc = neteaseSource.live_url;
                        neteaseSource.liveType = 'video/mp4';
                        if (liveStream.live_type != 'record') {
                            if (isH5VideoSupported) {
                                neteaseSource.liveSrc = neteaseSource.hls_url;
                                neteaseSource.liveType = 'application/x-mpegURL';
                            } else if (!!neteaseSource.http_url && (neteaseSource.http_url.includes('.flv'))) {
                                neteaseSource.liveSrc = neteaseSource.http_url;
                                neteaseSource.liveType = 'video/x-flv';
                            } else if (!!neteaseSource.rtmp_url) {
                                neteaseSource.liveSrc = neteaseSource.rtmp_url;
                                neteaseSource.liveType = 'rtmp/flv';
                            } else {
                                throw new Error('invalid livestream source');
                            }
                        } else { // record
                            neteaseSource.liveSrc = neteaseSource.record_url || '';
                            neteaseSource.liveSrc.includes('.flv') && (neteaseSource.liveType = 'video/flv');
                        }
                    }

                    renderData.headImage = null; // 直播文章不显示头图
                    renderData.commentZone = null; // 直播文章不显示评论区
                    renderData.liveStream = {
                        isVhall: isVhall,
                        netease: neteaseSource,
                        isH5VideoSupported: isH5VideoSupported,
                        liveStreamUrl: liveStreamUrl
                    };
                    break;
                }
                case 'collection':{
                    // 专题分享页
                    renderData.viewName = 'collection';
                    const promise = new Promise((resolve, reject) => vendor.promise(request, util.format('/api/1/resources/stream?app_id=10086&app_ver=20.0.0&offset=0&count=10&collection_id=%s', contentId), 'GET', resolve, reject));
                    promise.then(responseData => {
                        if (!responseData.successful || responseData.rawStatusCode != serverConfigs.successResponseStatusCode) {
                            throw new Error('Get collection data Error!');
                        }
                        renderData.resources = vendor.renderCollection(responseData.data.resources, request);
                        renderData.collection = responseData.data.collection || {};
                        return response.render('index', renderData);
                    });
                    break;
                }
                case 'link':
                    return response.redirect(detailData.content);
                    break;
                default:
                    throw new Error('invalid content type');
                }
            }

            if (detailData.content_type != 'collection') {
                response.render('index', renderData);
            }
        }).catch(error => response.redirect('/download'));
    });

    app.get(/\/(mall\/item)\/([\d]+)/, (request, response) => {
        const userAgent = request.headers['user-agent'];
        const contentGroup = request.params[0];
        const contentId = request.params[1];
        /* eslint-disable no-underscore-dangle */
        const promise = new Promise((resolve, reject) => vendor.promise(request, util.format('/api/2%s?app_id=10086&%s', request.path, request._parsedUrl.query), 'GET', resolve, reject));
        /* eslint-enable no-underscore-dangle */
        promise.then(responseData => {
            if (!responseData.successful || !responseData.data) {
                return response.redirect('/download');
            }

            const itemData = responseData.data;
            const renderData = itemData.item;
            renderData.comment_count && (renderData.createTime = utils.formatDate(new Date(1000 * renderData.comments[0].create_time), 'yyyy.MM.dd'));
            renderData.comments[0].reply_count && (renderData.headImage = renderData.comments[0].replies[0].profile.head_image || '');
            renderData.comments[0].reply_count && (renderData.profileName = renderData.comments[0].replies[0].profile.name || '');
            renderData.comments[0].reply_count && (renderData.profileComment = renderData.comments[0].replies[0].comment || '');
            if (renderData.white_list && typeof renderData.white_list == 'string') {
                renderData.white_list = JSON.parse(renderData.white_list);
            }
            renderData.title = itemData.item.name + ' - 蔚来';
            renderData.viewName = 'mall';
            renderData.viewInfo = {
                resourceId: contentId,
                resourceType: contentGroup,
                device: utils.getDeviceInfo(userAgent)
            };

            renderData.bottomBannerContent = utils.createBottomBannerContent(request, renderData);
            response.render('index', renderData);
        }).catch(exception => response.redirect('/download'));
    });

    app.get('/download', (request, response) => {
        const deviceInfo = utils.getDeviceInfo(request.headers['user-agent']);
        const downloadInfo = {
            ios: {
                tip: 'iPhone下载',
                url: deviceInfo.browser == 'wechat' ? androidDownloadLink : iosDownloadLink
            },
            android: {
                tip: 'android下载',
                url: androidDownloadLink
            }
        };
        response.render('index', {
            viewName: 'download',
            showWeiboTips: deviceInfo.browser == 'weibo',
            downloadInfo: downloadInfo,
            deviceType: deviceInfo.type
        });
    });
};
