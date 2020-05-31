import { Share } from "react-native";

const Share_share = 'ReactNative.Share.share'
const Share_sharedAction = 'ReactNative.Share.sharedAction'
const Share_dismissedAction = 'ReactNative.Share.dismissedAction'

var ShareApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : Share_share,
                handler : (res, responseCallback) => {
                    var content = res && res.content
                    var options = res && res.options
                    Share.share(content,options).then(r => {
                        responseCallback && responseCallback({result:r})
                    }).catch(err => {
                        responseCallback && responseCallback({
                            code : err.code,
                            message : err.message
                        })
                    });
                },
            },
            {
                name : Share_sharedAction,
                handler : (res, responseCallback) => {
                    var result = Share.sharedAction;
                    responseCallback && responseCallback(result);
                },
            },
            {
                name : Share_dismissedAction,
                handler : (res, responseCallback) => {
                    var result = Share.dismissedAction;
                    responseCallback && responseCallback(result);
                },
            },

        ],

        inject : `
            // Share API
            // https://reactnative.dev/docs/Share
            var Share = {};
            window.ReactNativeWebView.Share = window.ReactNativeWebView.Share || Share;
            
            // @api window.ReactNativeWebView.Share.share
            Share.share = function(content,options) {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${Share_share}',{content:content,options:options}, function(res) {
                        if(res.code) {
                            reject(res);
                        } else {
                            resolve(res && res.result)
                        }
                    })
                });
                
            }

            // @api window.ReactNativeWebView.Share.sharedAction
            Share.sharedAction = function() {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${Share_sharedAction}',{}, function(res) {
                        resolve(res);
                    })
                });
            }

            // @api window.ReactNativeWebView.Share.dismissedAction
            Share.dismissedAction = function() {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${Share_dismissedAction}',{}, function(res) {
                        resolve(res);
                    })
                });
            }
        `
    }
}

module.exports = ShareApis