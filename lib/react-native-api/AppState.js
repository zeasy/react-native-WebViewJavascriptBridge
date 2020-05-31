import { AppState } from "react-native";

const AppState_addEventListener = 'ReactNative.AppState.addEventListener'
const AppState_removeEventListener = 'ReactNative.AppState.removeEventListener'
const AppState_currentState = 'ReactNative.AppState.currentState'

const AppState_onEventListener = 'ReactNative.AppState.onEventListener'

var listeners = {}; 

var AppStateApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : AppState_addEventListener,
                handler : (res, responseCallback) => {
                    var type = res && res.type;
                    var listener = (event) => {
                        ref.callHandler(AppState_onEventListener,{event,type});
                    }
                    AppState.addEventListener(type,listener)
                    listeners[type] = listener;
                    responseCallback && responseCallback({type})
                },
                
            },
            {
                name : AppState_removeEventListener,
                handler : (res, responseCallback) => {
                    var type = res && res.type;
                    var listener = listeners[type];
                    if(listener) {
                        AppState.removeEventListener(type,listener)
                        delete listeners[type]
                    }
                    responseCallback && responseCallback()
                },
            },
            {
                name : AppState_currentState,
                handler : (res, responseCallback) => {
                    var currentState = AppState.currentState;
                    responseCallback && responseCallback({currentState})
                },
            }
        ],

        inject : `
            // AppState API
            // https://reactnative.dev/docs/appstate
            var AppState = {};
            window.ReactNativeWebView.AppState = window.ReactNativeWebView.AppState || AppState;
            
            var listeners = {};
        
            window.${bridgeName}.registerHandler('${AppState_onEventListener}',function(options, responseCallback) {
                var event = options.event;
                var type = options.type;
                var listener = listeners[type];
                listener && listener(event);
            })

            // @api window.ReactNativeWebView.AppState.addEventListener
            AppState.addEventListener = function(type,listener) {
                window.${bridgeName}.callHandler('${AppState_addEventListener}',{type:type}, function(res) {
                    listeners[type] = listener;
                })
            }

            // @api window.ReactNativeWebView.AppState.removeEventListener
            AppState.removeEventListener = function(type,listener) {
                var listener = listeners[type];
                if (!listener) return;
                delete listeners[type];
                window.${bridgeName}.callHandler('${AppState_removeEventListener}',{type:type})
            }

            // @api window.ReactNativeWebView.AppState.currentState
            AppState.currentState = function() {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${AppState_currentState}',{}, function(res) {
                        resolve(res);
                    })
                });
            }
        `
    }
}

module.exports = AppStateApis