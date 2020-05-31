import { DeviceEventEmitter } from "react-native";

const DeviceEventEmitter_addListener = 'ReactNative.DeviceEventEmitter.addListener'
const DeviceEventEmitter_removeListener = 'ReactNative.DeviceEventEmitter.removeListener'
const DeviceEventEmitter_emit = 'ReactNative.DeviceEventEmitter.emit'

const DeviceEventEmitter_onEventListener = 'ReactNative.DeviceEventEmitter.onEventListener'

var listeners = {}; 
var uniqueId = 0;

var DeviceEventEmitterApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : DeviceEventEmitter_addListener,
                handler : (res, responseCallback) => {
                    var eventName = res && res.eventName;
                    var eventId = ++uniqueId;
                    var listener = (event) => {
                        ref.callHandler(DeviceEventEmitter_onEventListener,{event,eventName,eventId});
                    }
                    var listenerHandler = DeviceEventEmitter.addListener(eventName,listener)
                    listeners[eventId] = listenerHandler;
                    responseCallback && responseCallback({eventName,eventId})
                },
                
            },
            {
                name : DeviceEventEmitter_removeListener,
                handler : (res, responseCallback) => {
                    var eventId = res && res.eventId;
                    var listener = listeners[eventId];
                    if(listener) {
                        listener.remove()
                        delete listeners[eventId]
                    }
                    responseCallback && responseCallback()
                },
            },
            {
                name : DeviceEventEmitter_emit,
                handler : (res, responseCallback) => {
                    var eventName = res && res.eventName
                    var body = res && res.body
                    DeviceEventEmitter.emit(eventName,body)
                    responseCallback && responseCallback({})
                },
            }
        ],

        inject : `
            // DeviceEventEmitter API
            // https://reactnative.dev/docs/DeviceEventEmitter
            var DeviceEventEmitter = {};
            window.ReactNativeWebView.DeviceEventEmitter = window.ReactNativeWebView.DeviceEventEmitter || DeviceEventEmitter;
            
            var listeners = {};
        
            window.${bridgeName}.registerHandler('${DeviceEventEmitter_onEventListener}',function(options, responseCallback) {
                var event = options.event;
                var eventId = options.eventId;
                var listener = listeners[eventId];
                listener && listener(event);
            })

            // @api window.ReactNativeWebView.DeviceEventEmitter.addListener
            DeviceEventEmitter.addListener = function(eventName,listener) {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${DeviceEventEmitter_addListener}',{eventName:eventName}, function(res) {
                        var eventId = res.eventId;
                        listeners[eventId] = listener;
                        resolve({
                            remove : function() {
                                window.${bridgeName}.callHandler('${DeviceEventEmitter_removeListener}',{eventId:eventId}, function(res) {
                                    delete listeners[eventId];
                                })
                            }
                        });
                    })
                });   
            }

            // @api window.ReactNativeWebView.DeviceEventEmitter.emit
            DeviceEventEmitter.emit = function(eventName, body) {
                window.${bridgeName}.callHandler('${DeviceEventEmitter_emit}',{eventName:eventName, body:body});
            }
        `
    }
}

module.exports = DeviceEventEmitterApis