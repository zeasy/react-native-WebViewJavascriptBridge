import { StatusBar } from "react-native";

var StatusBar_currentHeight = 'ReactNative.StatusBar.currentHeight'
var StatusBar_popStackEntry = 'ReactNative.StatusBar.popStackEntry'
var StatusBar_pushStackEntry = 'ReactNative.StatusBar.pushStackEntry'
var StatusBar_replaceStackEntry = 'ReactNative.StatusBar.replaceStackEntry'
var StatusBar_setBackgroundColor = 'ReactNative.StatusBar.setBackgroundColor'
var StatusBar_setBarStyle = 'ReactNative.StatusBar.setBarStyle'
var StatusBar_setHidden = 'ReactNative.StatusBar.setHidden'
var StatusBar_setNetworkActivityIndicatorVisible = 'ReactNative.StatusBar.setNetworkActivityIndicatorVisible'
var StatusBar_setTranslucent = 'ReactNative.StatusBar.setTranslucent'


var entrys = {}
var uniqueId = 0;

var StatusBarApis = (ref,bridgeName) => {
    return {
        handlers : [{
                name : StatusBar_currentHeight,
                handler : (options, responseCallback) => {
                    responseCallback && responseCallback(StatusBar.currentHeight)
                },
            },
            {
                name : StatusBar_popStackEntry,
                handler : (options, responseCallback) => {
                    var entryId = options && options.entryId;
                    var originEntry = entrys[entryId]
                    StatusBar.popStackEntry(originEntry)
                    delete entrys[entryId]
                    responseCallback && responseCallback()
                }
            },
            {
                name : StatusBar_pushStackEntry,
                handler : (options, responseCallback) => {
                    var entry = options && options.entry;
                    var res = StatusBar.pushStackEntry(entry)
                    var entryId = ++uniqueId;
                    entrys[entryId] = res;
                    responseCallback && responseCallback({
                        ...res,
                        entryId
                    })
                }
            },
            {
                name : StatusBar_replaceStackEntry,
                handler : (options, responseCallback) => {
                    var props = options && options.props;
                    var entry = options && options.entry;
                    var entryId = entry && entry.entryId;
                    var originEntry = entrys[entryId];
                    var res = StatusBar.replaceStackEntry(originEntry,props)
                    delete entrys[entryId]
                    var replaceEntryId = ++uniqueId;
                    entrys[replaceEntryId] = res;
                    responseCallback && responseCallback({
                        ...res,
                        entryId:replaceEntryId
                    })
                }
            },
            {
                name : StatusBar_setBackgroundColor,
                handler : (options, responseCallback) => {
                    var color = options && options.color;
                    var animated = options && options.animated;
                    StatusBar.setBackgroundColor(color,animated)
                    responseCallback && responseCallback({})
                }
            },
            {
                name : StatusBar_setBarStyle,
                handler : (options, responseCallback) => {
                    var style = options && options.style;
                    var animated = options && options.animated;
                    StatusBar.setBarStyle(style,animated)
                    responseCallback && responseCallback({})
                }
            },
            {
                name : StatusBar_setHidden,
                handler : (options, responseCallback) => {
                    var hidden = options && options.hidden;
                    var animation = options && options.animation;
                    StatusBar.setHidden(hidden,animation)
                    responseCallback && responseCallback({})
                }
            },
            {
                name : StatusBar_setNetworkActivityIndicatorVisible,
                handler : (options, responseCallback) => {
                    var visible = options && options.visible;
                    StatusBar.setNetworkActivityIndicatorVisible(visible)
                    responseCallback && responseCallback({})
                }
            },
            {
                name : StatusBar_setTranslucent,
                handler : (options, responseCallback) => {
                    var translucent = options && options.translucent;
                    StatusBar.setTranslucent(translucent)
                    responseCallback && responseCallback({})
                }
            }
        ],

        inject : `
                // StatusBar API
                // https://reactnative.dev/docs/statusbar
                var StatusBar = {};
                window.ReactNativeWebView.StatusBar = window.ReactNativeWebView.StatusBar || StatusBar;
    
                // @api window.ReactNativeWebView.StatusBar.currentHeight
                StatusBar.currentHeight = function() {
                    return new Promise(function(resolve) {
                        window.${bridgeName}.callHandler('${StatusBar_currentHeight}',{},function(res) {
                            resolve(res);
                        });
                    })
                }

                // @api window.ReactNativeWebView.StatusBar.popStackEntry
                StatusBar.popStackEntry = function(entry) {
                    window.${bridgeName}.callHandler('${StatusBar_popStackEntry}',entry);
                }

                // @api window.ReactNativeWebView.StatusBar.pushStackEntry
                StatusBar.pushStackEntry = function(entry) {
                    return new Promise(function(resolve) {
                        window.${bridgeName}.callHandler('${StatusBar_pushStackEntry}',{entry:entry}, function(res) {
                            resolve(res)
                        });
                    })
                }

                // @api window.ReactNativeWebView.StatusBar.replaceStackEntry
                StatusBar.replaceStackEntry = function(entry, props) {
                    return new Promise(function(resolve) {
                        window.${bridgeName}.callHandler('${StatusBar_replaceStackEntry}',{entry:entry,props:props}, function(res) {
                            resolve(res)
                        });
                    })
                }

                // @api window.ReactNativeWebView.StatusBar.setBackgroundColor
                StatusBar.setBackgroundColor = function(color,animated) {
                    window.${bridgeName}.callHandler('${StatusBar_setBackgroundColor}',{color:color,animated:animated});
                }

                // @api window.ReactNativeWebView.StatusBar.setBarStyle
                StatusBar.setBarStyle = function(style,animated) {
                    window.${bridgeName}.callHandler('${StatusBar_setBarStyle}',{style:style,animated:animated});
                }
                
                // @api window.ReactNativeWebView.StatusBar.setHidden
                StatusBar.setHidden = function(hidden,animation) {
                    window.${bridgeName}.callHandler('${StatusBar_setHidden}',{hidden:hidden,animation:animation});
                }

                // @api window.ReactNativeWebView.StatusBar.setNetworkActivityIndicatorVisible
                StatusBar.setNetworkActivityIndicatorVisible = function(visible) {
                    window.${bridgeName}.callHandler('${StatusBar_setNetworkActivityIndicatorVisible}',{visible:visible});
                }

                // @api window.ReactNativeWebView.StatusBar.setTranslucent
                StatusBar.setTranslucent = function(translucent) {
                    window.${bridgeName}.callHandler('${StatusBar_setTranslucent}',{translucent:translucent});
                }
                
            ` 
    }
}

module.exports = StatusBarApis