import { Linking } from "react-native";

const Linking_addEventListener = 'ReactNative.Linking.addEventListener'
const Linking_removeEventListener = 'ReactNative.Linking.removeEventListener'
const Linking_openURL = 'ReactNative.Linking.openURL'
const Linking_canOpenURL = 'ReactNative.Linking.canOpenURL'
const Linking_openSettings = 'ReactNative.Linking.openSettings'
const Linking_getInitialURL = 'ReactNative.Linking.getInitialURL'


const Linking_onListener = 'ReactNative.Linking.onListener'

var listenerMaps = {}; 
var uniqueId = 0;

var LinkingApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : Linking_addEventListener,
                handler : (res, responseCallback) => {
                    var type = res && res.type;
                    var listenerId = ++uniqueId;
                    var listener = (event) => {
                        ref.callHandler(Linking_onListener,{event,type,listenerId});
                    }
                    listenerMaps[type] = {...listenerMaps[type],[listenerId]:listener};
                    Linking.addEventListener(type,listener)
                    responseCallback && responseCallback({type,listenerId})
                },
            },
            {
                name : Linking_removeEventListener,
                handler : (res, responseCallback) => {
                    var type = res && res.type;
                    var listenerId = res && res.listenerId;
                    var listeners = listenerMaps[type];
                    var listener = listeners[listenerId]
                    if(listener) {
                        Linking.removeEventListener(type,listener)
                        delete listeners[listenerId]
                    }
                    responseCallback && responseCallback()
                },
            },
            {
                name : Linking_openURL,
                handler : (res, responseCallback) => {
                    var url = res && res.url;
                    Linking.openURL(url).then(res => {
                        responseCallback && responseCallback({openURL:res});
                    }).catch(err => {
                        responseCallback && responseCallback({
                            code : err.code,
                            message : err.message
                        })    
                    })
                },
            },
            {
                name : Linking_canOpenURL,
                handler : (res, responseCallback) => {
                    var url = res && res.url;
                    Linking.canOpenURL(url).then(res => {
                        responseCallback && responseCallback({canOpenURL:res});
                    }).catch(err => {
                        responseCallback && responseCallback({
                            code : err.code,
                            message : err.message
                        })    
                    })
                },
            },
            {
                name : Linking_openSettings,
                handler : (res, responseCallback) => {
                    Linking.openSettings().then(r => {
                        responseCallback && responseCallback({settings:r});
                    }).catch(err => {
                        responseCallback && responseCallback({
                            code : err.code,
                            message : err.message
                        })   
                    });
                    
                },
            },
            {
                name : Linking_getInitialURL,
                handler : (res, responseCallback) => {
                    Linking.getInitialURL().then(res => {
                        responseCallback && responseCallback({initialURL:res});
                    }).catch(err => {
                        responseCallback && responseCallback({
                            code : err.code,
                            message : err.message
                        })    
                    });
                    
                },
            }

            
        ],

        inject : `
            // Linking API
            // https://reactnative.dev/docs/Linking
            var Linking = {};
            window.ReactNativeWebView.Linking = window.ReactNativeWebView.Linking || Linking;
            
            var listenerMaps = {};
        
            window.${bridgeName}.registerHandler('${Linking_onListener}',function(options, responseCallback) {
                var event = options.event;
                var type = options.type;
                var listenerId = options.listenerId;
                var listeners = listenerMaps[type];
                var listener = listeners && listeners[listenerId];
                listener && listener(event);
            })

            // @api window.ReactNativeWebView.Linking.addEventListener
            Linking.addEventListener = function(type,listener) {
                window.${bridgeName}.callHandler('${Linking_addEventListener}',{type:type}, function(res) {
                    var type = res.type;
                    var listenerId = res.listenerId;
                    var listeners = listenerMaps[type] || {};
                    listeners[listenerId] = listener;
                    listenerMaps[type] = listeners;
                })
            }

            // @api window.ReactNativeWebView.Linking.removeEventListener
            Linking.removeEventListener = function(type,listener) {
                var listeners = listenerMaps[type];
                if(listeners) {
                    var keys = Object.keys(listeners)
                    var listenerId = keys.filter(key => listeners[key] === listener)[0];
                    if(listenerId) {
                        delete listeners[listenerId];
                        window.${bridgeName}.callHandler('${Linking_removeEventListener}',{type:type,listenerId:listenerId})
                    }
                }
            }

            // @api window.ReactNativeWebView.Linking.openURL
            Linking.openURL = function(url) {
                return new Promise(function(resolve,reject){
                    window.${bridgeName}.callHandler('${Linking_openURL}',{url:url}, function(res) {
                        if(res.code) {
                            reject(res);
                        } else {
                            resolve(res && res.openURL)
                        }
                    })
                })
            }

            // @api window.ReactNativeWebView.Linking.canOpenURL
            Linking.canOpenURL = function(url) {
                return new Promise(function(resolve,reject){
                    window.${bridgeName}.callHandler('${Linking_canOpenURL}',{url:url}, function(res) {
                        if(res.code) {
                            reject(res);
                        } else {
                            resolve(res && res.canOpenURL)
                        }
                    })
                })
            }

            // @api window.ReactNativeWebView.Linking.openSettings
            Linking.openSettings = function() {
                return new Promise(function(resolve,reject){
                    window.${bridgeName}.callHandler('${Linking_openSettings}',{}, function(res) {
                        if(res.code) {
                            reject(res);
                        } else {
                            resolve(res && res.settings)
                        }
                    })
                })
            }

            // @api window.ReactNativeWebView.Linking.getInitialURL
            Linking.getInitialURL = function() {
                return new Promise(function(resolve,reject){
                    window.${bridgeName}.callHandler('${Linking_getInitialURL}',{}, function(res) {
                        if(res.code) {
                            reject(res);
                        } else {
                            resolve(res && res.initialURL)
                        }
                    })
                })
            }
        `
    }
}

module.exports = LinkingApis