# WebviewJavascriptBridge for React Native
  [WebviewJavascriptBridge](https://github.com/marcuswestin/WebViewJavascriptBridge) implemented on [react-native-webview](https://github.com/react-native-community/react-native-webview)
  
  The code logic comes from the `WebviewJavascriptBridge`. It is fully implemented by JS. In theory, it supports the platform supported by `react-native-webview`.
  
  - [x] iOS (Tested)
  - [x] Android (Not tested)
  - [x] MacOS (Tested)
  - [x] Windows (Not tested)

## Usage reference
  https://github.com/marcuswestin/WebViewJavascriptBridge#usage

## Install
  In the `React Native` project：
  ```
  npm i react-native-webviewjavascriptbridge
  ```

  in the `Web` project：
  ```
  npm i webview-javascript-bridge-promised
  ```
  
  Or add code to a `Web` project：
  
  ```
  function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
  }
  ```
## Method registration and call
### In React Native：
```
  import WebViewJavascriptBridge from 'react-native-webviewjavascriptbridge';
  
  render() {
    return (
      <WebViewJavascriptBridge ref="bridge"/>
    )
  }
  
  //register
  registerRNApi() {
    this.refs.bridge.registerHandler('rn_method_1',(params, responseCallback) => {
      console.log('call rn_method_1 from web',params);
      responseCallback('success');
    });
  }
  
  //call
  callWebApi() {
    this.refs.bridge.callHandler('web_method_1',{'key':'value'},(res) => {
      console.log('call web_method_1 resp:',res);
    });
  }

```
### In Web：

  Using webview-javascript-bridge-promised：
  
  ```
  var bridge = require('webview-javascript-bridge-promised')

  //register
  bridge.registerHandler('web_method_1',(params, responseCallback) => {
      console.log('call web_method_1 from RN',params);
      responseCallback('success');
  });

  //call
    bridge.callHandler('rn_method_1',{'key':'value'},(res) => {
        console.log('call rn_method_1 resp:',res);
    }); 

  ```
  
  Using add code setupWebViewJavascriptBridge(callback):
  
  ```
  setupWebViewJavascriptBridge(function(bridge) {

    /* Initialize your app here */

    bridge.registerHandler('web_method_1', function(data, responseCallback) {
      console.log("JS Echo called with:", data)
      responseCallback(data)
    })
    bridge.callHandler('rn_method_1', {'key':'value'}, function responseCallback(responseData) {
      console.log("JS received response:", responseData)
    })
  })
  ```

## Props
1. protocolScheme

      Message transfer protocol Scheme
      
      Default:`https`
      
      Compatible with `WebViewJavaScriptBridge` project. It can be customized and needs to be modified synchronously with the web.
   
2. bridgeName

      Bridge Name
      
      Default:`WebViewJavascriptBridge`
      
      Compatible with `WebViewJavaScriptBridge` project. It can be customized and needs to be modified synchronously with the web.

3. callbacksName

      callbacks Name
      
      Default:`WVJBCallbacks`
      
      Compatible with `WebViewJavaScriptBridge` project. It can be customized and needs to be modified synchronously with the web.
  
    Example：
    
    ```
      //RN
      render() {
        return (
          <WebViewJavascriptBridge ref="bridge" 
                                   protocolScheme="rnapi" 
                                   bridgeName="rnbridge" 
                                   callbacksName="rncallbacks"
          />
        )
      } 

      //Web,set before require('webview-javascript-bridge-promised')
      window.WebViewJavascriptProtocolScheme = "rnapi"
      window.WebViewJavascriptBridgeName = "rnbridge"
      window.WebViewJavascriptCallbacksName = "rncallbacks"
    ```
  
4. supportReactNativeApis

    React Native API has been implemented:
  
      - [Alert](https://reactnative.dev/docs/alert)
      - [Appearance](https://reactnative.dev/docs/appearance)
      - [AppState](https://reactnative.dev/docs/appstate)
      - [DevSettings](https://reactnative.dev/docs/devsettings)
      - [Dimensions](https://reactnative.dev/docs/dimensions)
      - [Keyboard](https://reactnative.dev/docs/keyboard)
      - [Linking](https://reactnative.dev/docs/linking)
      - [PixelRatio](https://reactnative.dev/docs/pixelratio)
      - [Share](https://reactnative.dev/docs/share)
      - [Vibration](https://reactnative.dev/docs/vibration)
    
    In addition:
   
      - Platform
      - DeviceEventEmitter

    When calling RN API in Web, it is the same as RN calling, RN API is `window.ReactNativeWebView` Called in this global variable.
    
    ```
      window.ReactNativeWebView.Alert.alert("title","message",[{
          text : "OK",
          onPress : () => {
            console.log('OK');
          }
        },{
          text : "Cancel",
          type : "cancel",
          onPress : () => {
            console.log('cancel');
          }
        }],{});
    ```
    
    **Warning**
      
    Calling RN API in Web needs to called after the page is loaded, Example:
    
    ```
    useEffect(() => {
      window.ReactNativeWebView.Alert.alert()
    });
    
    componentDidMount() {
      window.ReactNativeWebView.Alert.alert()
    }
    ```
    
    If you want to call the RN API safely anywhere, use:
    
    ```
    var bridge = require('webview-javascript-bridge-promised')
    bridge.promised().then(() => {
      window.ReactNativeWebView.Alert.alert()
    })
    ```
