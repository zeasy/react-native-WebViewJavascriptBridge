import { Appearance } from "react-native";

const Appearance_getColorScheme = 'ReactNative.Appearance.getColorScheme'
const Appearance_addChangeListener = 'ReactNative.Appearance.addChangeListener'
const Appearance_removeChangeListener = 'ReactNative.Appearance.removeChangeListener'

const Appearance_onChangeListener = 'ReactNative.Appearance.onChangeListener'

var listeners = {};
var uniqueId = 0;

var AppearanceApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : Appearance_getColorScheme,
                handler : (res, responseCallback) => {
                    var colorScheme = Appearance.getColorScheme();
                    responseCallback && responseCallback({colorScheme})
                },
            }, 
            {
                name : Appearance_addChangeListener,
                handler : (res, responseCallback) => {
                    var listenerId = ++uniqueId;
                    var listener = (change) => {
                        ref.callHandler(Appearance_onChangeListener,{change,listenerId});
                    }
                    Appearance.addChangeListener(listener)
                    listeners[listenerId] = listener;
                    responseCallback && responseCallback({listenerId})
                },
                
            },
            {
                name : Appearance_removeChangeListener,
                handler : (res, responseCallback) => {
                    var listenerId = res && res.listenerId;
                    var listener = listeners[listenerId];
                    if(listener) {
                        Appearance.removeChangeListener(listener)
                        delete listeners[listenerId]
                    }
                    responseCallback && responseCallback()
                },
            }
        ],

        inject : `
            // Appearance API
            // https://reactnative.dev/docs/appearance
            var Appearance = {};
            window.ReactNativeWebView.Appearance = window.ReactNativeWebView.Appearance || Appearance;

            // @api window.ReactNativeWebView.Appearance.getColorScheme
            Appearance.getColorScheme = function() {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${Appearance_getColorScheme}',{}, function(res) {
                        resolve(res);
                    })
                });
            }
            
            var listeners = {};
        
            window.${bridgeName}.registerHandler('${Appearance_onChangeListener}',function(options, responseCallback) {
                var change = options.change;
                var listenerId = options.listenerId;
                var listener = listeners[listenerId];
                listener && listener(change);
            })

            // @api window.ReactNativeWebView.Appearance.addChangeListener
            Appearance.addChangeListener = function(listener) {
                window.${bridgeName}.callHandler('${Appearance_addChangeListener}',{}, function(res) {
                    listeners[res.listenerId] = listener;
                })
            }

            // @api window.ReactNativeWebView.Appearance.removeChangeListener
            Appearance.removeChangeListener = function(listener) {
                var keys = Object.keys(listeners);
                var ks = keys.filter(function(key) {
                    return listeners[key] === listener;
                })
                var listenerId = ks[0];
                if (!listenerId) return;
                delete listeners[listenerId];
                window.${bridgeName}.callHandler('${Appearance_removeChangeListener}',{listenerId:listenerId})
            }
        `
    }
}

module.exports = AppearanceApis