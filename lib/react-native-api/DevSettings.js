import { DevSettings } from "react-native";

const DevSettings_addMenuItem = 'ReactNative.DevSettings.addMenuItem'
const DevSettings_reload = 'ReactNative.DevSettings.reload'

const DevSettings_onMenuListener = 'ReactNative.DevSettings.onMenuListener'

var handlers = {}; 

var DevSettingsApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : DevSettings_addMenuItem,
                handler : (res, responseCallback) => {
                    var title = res && res.title;
                    var handler = (event) => {
                        ref.callHandler(DevSettings_onMenuListener,{event,title});
                    }
                    DevSettings.addMenuItem(title,handler)
                    handlers[title] = handler;
                    responseCallback && responseCallback({title})
                },
                
            },
            {
                name : DevSettings_reload,
                handler : (res, responseCallback) => {
                    DevSettings.reload()
                    responseCallback && responseCallback()
                },
            },
        ],

        inject : `
            // DevSettings API
            // https://reactnative.dev/docs/devsettings
            var DevSettings = {};
            window.ReactNativeWebView.DevSettings = window.ReactNativeWebView.DevSettings || DevSettings;
            
            var handlers = {};
        
            window.${bridgeName}.registerHandler('${DevSettings_onMenuListener}',function(options, responseCallback) {
                var event = options.event;
                var title = options.title;
                var handler = handlers[title];
                handler && handler(event);
            })

            // @api window.ReactNativeWebView.DevSettings.addMenuItem
            DevSettings.addMenuItem = function(title,handler) {
                window.${bridgeName}.callHandler('${DevSettings_addMenuItem}',{title:title}, function(res) {
                    handlers[title] = handler;
                })
            }

            // @api window.ReactNativeWebView.DevSettings.reload
            DevSettings.reload = function() {
                window.${bridgeName}.callHandler('${DevSettings_reload}',{})
            }
        `
    }
}

module.exports = DevSettingsApis