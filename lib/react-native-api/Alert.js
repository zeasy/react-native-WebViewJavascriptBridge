import { Alert } from "react-native";

var Alert_alert = 'ReactNative.Alert.alert'

var AlertApis = (ref,bridgeName) => {
    return {
        handlers : [{
            name : Alert_alert,
            handler : (options, responseCallback) => {
                options = options || {}
                var title = options.title || ''
                var message = options.message
                var buttons = options.buttons
                var opts = options.options
        
                var alertButtons = buttons && buttons.map((button,index) => {
                    return {
                        text : button.text,
                        style : button.style,
                        onPress : () => {
                            responseCallback && responseCallback({'index':index,button})
                        }
                    }
                })
                Alert.alert(title,message,alertButtons,opts)
            },
        }],

        inject : `
                // Alert API
                // https://reactnative.dev/docs/alert
                var Alert = {};
                window.ReactNativeWebView.Alert = window.ReactNativeWebView.Alert || Alert;
    
                // @api window.ReactNativeWebView.Alert.alert
                Alert.alert = function(title, message, buttons, options) {
                    var buttonPresses = buttons && buttons.map(function(button) {
                        return button.onPress
                    });
                    var buttonOpts = buttons && buttons.map(function(button) {
                        return {
                            text : button.text,
                            style : button.style
                        }
                    });
                    window.${bridgeName}.callHandler('${Alert_alert}',{
                        title : title,
                        message : message,
                        buttons : buttonOpts,
                        options : options
                    },function(res) {
                        var index = res && res.index;
                        if(index >= 0) {
                            var press = buttonPresses && buttonPresses[index];
                            press && press();
                        }
                    });
                }
                
            ` 
    }
}

module.exports = AlertApis