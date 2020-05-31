import { Dimensions } from "react-native";

const Dimensions_addEventListener = 'ReactNative.Dimensions.addEventListener'
const Dimensions_removeEventListener = 'ReactNative.Dimensions.removeEventListener'
const Dimensions_get = 'ReactNative.Dimensions.get'
const Dimensions_set = 'ReactNative.Dimensions.set'

const Dimensions_onEventListener = 'ReactNative.Dimensions.onEventListener'

var listeners = {}; 

var DimensionsApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : Dimensions_addEventListener,
                handler : (res, responseCallback) => {
                    var type = res && res.type;
                    var listener = (event) => {
                        ref.callHandler(Dimensions_onEventListener,{event,type});
                    }
                    Dimensions.addEventListener(type,listener)
                    listeners[type] = listener;
                    responseCallback && responseCallback({type})
                },
                
            },
            {
                name : Dimensions_removeEventListener,
                handler : (res, responseCallback) => {
                    var type = res && res.type;
                    var listener = listeners[type];
                    if(listener) {
                        Dimensions.removeEventListener(type,listener)
                        delete listeners[type]
                    }
                    responseCallback && responseCallback()
                },
            },
            {
                name : Dimensions_get,
                handler : (res, responseCallback) => {
                    var dim = res && res.dim;
                    var dims = Dimensions.get(dim)
                    responseCallback && responseCallback(dims)
                },
            },
            {
                name : Dimensions_set,
                handler : (res, responseCallback) => {
                    var dims = res && res.dims;
                    Dimensions.set(dims)
                    responseCallback && responseCallback()
                },
            }
        ],

        inject : `
            // Dimensions API
            // https://reactnative.dev/docs/Dimensions
            var Dimensions = {};
            window.ReactNativeWebView.Dimensions = window.ReactNativeWebView.Dimensions || Dimensions;
            
            var listeners = {};
        
            window.${bridgeName}.registerHandler('${Dimensions_onEventListener}',function(options, responseCallback) {
                var event = options.event;
                var type = options.type;
                var listener = listeners[type];
                listener && listener(event);
            })

            // @api window.ReactNativeWebView.Dimensions.addEventListener
            Dimensions.addEventListener = function(type,listener) {
                window.${bridgeName}.callHandler('${Dimensions_addEventListener}',{type:type}, function(res) {
                    listeners[type] = listener;
                })
            }

            // @api window.ReactNativeWebView.Dimensions.removeEventListener
            Dimensions.removeEventListener = function(type,listener) {
                var listener = listeners[type];
                if (!listener) return;
                delete listeners[type];
                window.${bridgeName}.callHandler('${Dimensions_removeEventListener}',{type:type})
            }

            // @api window.ReactNativeWebView.Dimensions.get
            Dimensions.get = function(dim) {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${Dimensions_get}',{dim:dim}, function(res) {
                        resolve(res);
                    })
                });
            }

            // @api window.ReactNativeWebView.Dimensions.set
            Dimensions.set = function(dims) {
                return new Promise(function(resolve,reject) {
                    window.${bridgeName}.callHandler('${Dimensions_get}',{dims:dims}, function(res) {
                        resolve(res);
                    })
                });
            }
        `
    }
}

module.exports = DimensionsApis