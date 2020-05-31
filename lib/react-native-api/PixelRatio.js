import { PixelRatio } from "react-native";

const PixelRatio_get = 'ReactNative.PixelRatio.get'
const PixelRatio_getFontScale = 'ReactNative.PixelRatio.getFontScale'
const PixelRatio_getPixelSizeForLayoutSize = 'ReactNative.PixelRatio.getPixelSizeForLayoutSize'
const PixelRatio_roundToNearestPixel = 'ReactNative.PixelRatio.roundToNearestPixel'

var PixelRatioApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : PixelRatio_get,
                handler : (res, responseCallback) => {
                    var result = PixelRatio.get();
                    responseCallback && responseCallback(result);
                },
            },
            {
                name : PixelRatio_getFontScale,
                handler : (res, responseCallback) => {
                    var result = PixelRatio.getFontScale();
                    responseCallback && responseCallback(result);
                },
            },
            {
                name : PixelRatio_getPixelSizeForLayoutSize,
                handler : (res, responseCallback) => {
                    var layoutSize = res && res.layoutSize;
                    var result = PixelRatio.getPixelSizeForLayoutSize(layoutSize);
                    responseCallback && responseCallback(result);
                },
            },
            {
                name : PixelRatio_roundToNearestPixel,
                handler : (res, responseCallback) => {
                    var layoutSize = res && res.layoutSize;
                    var result = PixelRatio.roundToNearestPixel(layoutSize);
                    responseCallback && responseCallback(result);
                },
            }

            
        ],

        inject : `
            // PixelRatio API
            // https://reactnative.dev/docs/PixelRatio
            var PixelRatio = {};
            window.ReactNativeWebView.PixelRatio = window.ReactNativeWebView.PixelRatio || PixelRatio;
            
            // @api window.ReactNativeWebView.PixelRatio.get
            PixelRatio.get = function() {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${PixelRatio_get}',{}, function(res) {
                        resolve(res);
                    })
                });
                
            }

            // @api window.ReactNativeWebView.PixelRatio.getFontScale
            PixelRatio.getFontScale = function() {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${PixelRatio_getFontScale}',{}, function(res) {
                        resolve(res);
                    })
                });
            }

            // @api window.ReactNativeWebView.PixelRatio.getPixelSizeForLayoutSize
            PixelRatio.getPixelSizeForLayoutSize = function(layoutSize) {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${PixelRatio_getPixelSizeForLayoutSize}',{layoutSize:layoutSize}, function(res) {
                        resolve(res);
                    })
                });
            }

            // @api window.ReactNativeWebView.PixelRatio.roundToNearestPixel
            PixelRatio.roundToNearestPixel = function(layoutSize) {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${PixelRatio_roundToNearestPixel}',{layoutSize:layoutSize}, function(res) {
                        resolve(res);
                    })
                });
            }
        `
    }
}

module.exports = PixelRatioApis