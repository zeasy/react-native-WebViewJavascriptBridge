import { Platform } from "react-native";

const Platform_get = 'ReactNative.Platform.get'

var PlatformApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : Platform_get,
                handler : (res, responseCallback) => {
                    var keys = Object.keys(Platform);
                    var platform = {}
                    keys.forEach(key => {
                        if(typeof key == 'string' && key.indexOf('_') == 0) {
                            return;
                        }
                        var value = Platform[key];
                        if(value && typeof value !== 'function') {
                            platform[key] = value;
                        }
                    })
                    responseCallback && responseCallback(platform);
                },
            },
        ],

        inject : `
            // Platform API
            // https://reactnative.dev/docs/Platform
            var Platform = {};
            window.ReactNativeWebView.Platform = window.ReactNativeWebView.Platform || Platform;

            // @api window.ReactNativeWebView.Platform.get
            Platform.get = function() {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${Platform_get}',{}, function(res) {
                        resolve(res);
                    })
                });
            }
        `
    }
}

module.exports = PlatformApis