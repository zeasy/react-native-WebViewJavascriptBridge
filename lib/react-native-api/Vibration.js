import { Vibration } from "react-native";

const Vibration_vibrate = 'ReactNative.Vibration.vibrate'
const Vibration_cancel = 'ReactNative.Vibration.cancel'

var VibrationApis = (ref, bridgeName) => {
    return {
        handlers : [
            {
                name : Vibration_vibrate,
                handler : (res, responseCallback) => {
                    var pattern = res && res.pattern;
                    var repeat = res && res.repeat;
                    Vibration.vibrate(pattern,repeat);
                    responseCallback && responseCallback();
                },
            },
            {
                name : Vibration_cancel,
                handler : (res, responseCallback) => {
                    Vibration.cancel();
                    responseCallback && responseCallback();
                },
            },

        ],

        inject : `
            // Vibration API
            // https://reactnative.dev/docs/Vibration
            var Vibration = {};
            window.ReactNativeWebView.Vibration = window.ReactNativeWebView.Vibration || Vibration;

            // @api window.ReactNativeWebView.Vibration.vibrate
            Vibration.vibrate = function(pattern,repeat) {
                window.${bridgeName}.callHandler('${Vibration_vibrate}',{pattern:pattern,repeat:repeat});
            }

            // @api window.ReactNativeWebView.Vibration.cancel
            Vibration.cancel = function() {
                window.${bridgeName}.callHandler('${Vibration_cancel}',{})
            }
        `
    }
}

module.exports = VibrationApis