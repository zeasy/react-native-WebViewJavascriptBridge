import { Keyboard } from "react-native";

const Keyboard_addListener = 'ReactNative.Keyboard.addListener'
const Keyboard_removeListener = 'ReactNative.Keyboard.removeListener'
const Keyboard_removeAllListeners = 'ReactNative.Keyboard.removeAllListeners'
const Keyboard_dismiss = 'ReactNative.Keyboard.dismiss'

const Keyboard_onListener = 'ReactNative.Keyboard.onListener'

var listenerMaps = {}; 
var uniqueId = 0;

var KeyboardApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : Keyboard_addListener,
                handler : (res, responseCallback) => {
                    var eventName = res && res.eventName;
                    var listenerId = ++uniqueId;
                    var listener = (event) => {
                        ref.callHandler(Keyboard_onListener,{event,eventName,listenerId});
                    }
                    listenerMaps[eventName] = {...listenerMaps[eventName],[listenerId]:listener};
                    Keyboard.addListener(eventName,listener)
                    responseCallback && responseCallback({eventName,listenerId})
                },
            },
            {
                name : Keyboard_removeListener,
                handler : (res, responseCallback) => {
                    var eventName = res && res.eventName;
                    var listenerId = res && res.listenerId;
                    var listeners = listenerMaps[eventName];
                    var listener = listeners[listenerId]
                    if(listener) {
                        Keyboard.removeListener(eventName,listener)
                        delete listeners[listenerId]
                    }
                    responseCallback && responseCallback()
                },
            },
            {
                name : Keyboard_removeAllListeners,
                handler : (res, responseCallback) => {
                    var eventName = res && res.eventName;
                    delete listenerMaps[eventName]
                    Keyboard.removeAllListeners(eventName)
                    responseCallback && responseCallback()
                },
            },
            {
                name : Keyboard_dismiss,
                handler : (res, responseCallback) => {
                    Keyboard.dismiss()
                    responseCallback && responseCallback()
                },
            }
        ],

        inject : `
            // Keyboard API
            // https://reactnative.dev/docs/Keyboard
            var Keyboard = {};
            window.ReactNativeWebView.Keyboard = window.ReactNativeWebView.Keyboard || Keyboard;
            
            var listenerMaps = {};
        
            window.${bridgeName}.registerHandler('${Keyboard_onListener}',function(options, responseCallback) {
                var event = options.event;
                var eventName = options.eventName;
                var listenerId = options.listenerId;
                var listeners = listenerMaps[eventName];
                var listener = listeners && listeners[listenerId];
                listener && listener(event);
            })

            // @api window.ReactNativeWebView.Keyboard.addListener
            Keyboard.addListener = function(eventName,listener) {
                window.${bridgeName}.callHandler('${Keyboard_addListener}',{eventName:eventName}, function(res) {
                    var eventName = res.eventName;
                    var listenerId = res.listenerId;
                    var listeners = listenerMaps[eventName] || {};
                    listeners[listenerId] = listener;
                    listenerMaps[eventName] = listeners;
                })
            }

            // @api window.ReactNativeWebView.Keyboard.removeListener
            Keyboard.removeListener = function(eventName,listener) {
                var listeners = listenerMaps[eventName];
                if(listeners) {
                    var keys = Object.keys(listeners)
                    var listenerId = keys.filter(key => listeners[key] === listener)[0];
                    if(listenerId) {
                        delete listeners[listenerId];
                        window.${bridgeName}.callHandler('${Keyboard_removeListener}',{eventName:eventName,listenerId:listenerId})
                    }
                }
            }

            // @api window.ReactNativeWebView.Keyboard.removeAllListeners
            Keyboard.removeAllListeners = function(eventName,callback) {
                delete listenerMaps[eventName]
                window.${bridgeName}.callHandler('${Keyboard_removeAllListeners}',{eventName:eventName}, callback)
            }

            // @api window.ReactNativeWebView.Keyboard.dismiss
            Keyboard.dismiss = function(callback) {
                window.${bridgeName}.callHandler('${Keyboard_dismiss}',{}, callback)
            }
        `
    }
}

module.exports = KeyboardApis