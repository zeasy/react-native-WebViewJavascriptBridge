/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';

import { WebView } from 'react-native-webview';

var URL = require('url-parse');

const kQueueHasMessage = '__wvjb_queue_message__'
const kBridgeLoaded = '__bridge_loaded__'
const WebViewJavascriptBridge_JS = require('./WebViewJavascriptBridge_JS')

export default class WebViewJavascriptBridge extends React.Component {
    constructor(props) {
        super(props)

        this.protocolScheme = (props.protocolScheme || 'wvjbscheme').toLowerCase()
        this.bridgeName = props.bridgeName || 'WebViewJavascriptBridge'
        this.callbacksName = props.callbacksName || 'WVJBCallbacks'

        this.startupMessageQueue = []
        this.messageHandlers = {}
        this.responseCallbacks = {}
        this.uniqueId = 0

        this.supportReactNativeApis = props.supportReactNativeApis || true
    }

/*  #######  api  ######*/

    goForward() { this.refs['webViewRef'].goForward()}
    goBack() {this.refs['webViewRef'].goBack()}
    reload() {this.refs['webViewRef'].reload()}
    stopLoading() {this.refs['webViewRef'].stopLoading()}
    injectJavaScript(str) {this.refs['webViewRef'].injectJavaScript(str)}
    requestFocus() {this.refs['webViewRef'].requestFocus()}
    clearFormData() {this.refs['webViewRef'].clearFormData()}
    clearCache(b) { this.refs['webViewRef'].clearCache(b)}
    clearHistory() {this.refs['webViewRef'].clearHistory()}

    callHandler(handlerName,data,responseCallback) {this._callHandler(handlerName,data,responseCallback)}
    registerHandler(handlerName,handler) {this._registerHandler(handlerName,handler)}
    removeHandler(handlerName) { this._removeHandler(handlerName)}
    disableJavscriptAlertBoxSafetyTimeout() {this._disableJavscriptAlertBoxSafetyTimeout()}

    reset() {
        this.startupMessageQueue = []
        this.responseCallbacks = {}
        this.uniqueId = 0
    }


/* #### react native custom impl */
    reactNativeApis() {
        var ref = this.refs['webViewRef'];
        return [
            require('./react-native-api/Platform')(this,this.bridgeName),
            require('./react-native-api/DeviceEventEmitter')(this,this.bridgeName),
            
            //Api
            require('./react-native-api/Alert')(this,this.bridgeName),
            require('./react-native-api/Appearance')(this,this.bridgeName),
            require('./react-native-api/AppState')(this,this.bridgeName),
            require('./react-native-api/DevSettings')(this,this.bridgeName),
            require('./react-native-api/Dimensions')(this,this.bridgeName),
            require('./react-native-api/Keyboard')(this,this.bridgeName),
            require('./react-native-api/Linking')(this,this.bridgeName),
            require('./react-native-api/PixelRatio')(this,this.bridgeName),
            require('./react-native-api/Share')(this,this.bridgeName),
            require('./react-native-api/Vibration')(this,this.bridgeName),
            
            //Component
            require('./react-native-api/StatusBar')(this,this.bridgeName),
        ]
    }

    injectBridgeApiScript() {
        var apis = this.props.apis || [];
        if(this.supportReactNativeApis) {
            var reactNativeApis = this.reactNativeApis();
            apis = apis.concat(reactNativeApis)
        }
        var inject = '';
        apis.forEach(api => {
            if(api.handlers) {
                api.handlers.forEach(handler => {
                    if(handler.name && handler.handler) {
                        this.registerHandler(handler.name,handler.handler);
                    }
                })
            }
            if(api.inject) {
                inject += `
                (function(){
                    ${api.inject}
                })();`
            }
        })
        return inject;
    }

/* #### private ####*/

    _callHandler (handlerName,data,responseCallback) {
        this.sendData(data,responseCallback,handlerName)
    }

    _registerHandler(handlerName,handler) {
        this.messageHandlers[handlerName] = handler;
    }

    _removeHandler(handlerName) {
        delete this.messageHandlers[handlerName]
    }

    sendData(data,responseCallback,handlerName) {
        var message = {}
        if(data) message.data = data;
        if(responseCallback) {
            var callbackId = `objc_cb_${++this.uniqueId}`
            this.responseCallbacks[callbackId] = responseCallback;
            message.callbackId = callbackId;
        }
        if(handlerName) message.handlerName = handlerName;
        this._queueMessage(message)
    }

    flushMessageQueue(messages) {
        if(!messages || messages.length == 0) {
            console.log(`${this.bridgeName}: WARNING: RN got nil while fetching the message queue JSON from webview. This can happen if the ${this.bridgeName} JS is not currently present in the webview, e.g if the webview just loaded a new page.`);
            return ;
        }
        messages.forEach(message => {
            var responseId = message['responseId'];
            if(responseId) {
                var responseCallback = this.responseCallbacks[responseId]
                responseCallback && responseCallback(message['responseData'])
                delete this.responseCallbacks[responseId]
            } else {
                var responseCallback = undefined;
                var callbackId = message['callbackId']
                if(callbackId) {
                    responseCallback = (responseData) => {
                        var msg = {'responseId':callbackId,responseData}
                        this._queueMessage(msg)
                    }
                } else {
                    responseCallback = (responseData) => {}
                }

                var handler = this.messageHandlers[message['handlerName']];
                if(!handler) {
                    console.log(`WVJBNoHandlerException, No handler for message from JS:${JSON.stringify(message)}`)
                    return;
                }
                handler(message['data'],responseCallback)
            }
        });
    }

    injectJavascriptFile(){
        var injectScript = this.injectBridgeApiScript()
        var js = WebViewJavascriptBridge_JS(this.protocolScheme,this.bridgeName,this.callbacksName, injectScript)
        this._evaluateJavascript(js)
        if(this.startupMessageQueue) {
            var queue = [].concat(this.startupMessageQueue)
            this.startupMessageQueue = undefined;
            queue.forEach(message => {
                this._dispatchMessage(message)
            });
        }
    }

    isWebViewJavascriptBridgeURL(url) {
        if(!this.isSchemeMatch(url)) {
            return false;
        }
        return this.isBridgeLoadedURL(url) || this.isQueueMessageURL(url)
    }

    isSchemeMatch(url) {
        var urlScheme = url.protocol && url.protocol.split(':')[0]
        return urlScheme === this.protocolScheme
    }

    isQueueMessageURL(url) {
        var host = url.host && url.host.toLowerCase()
        return this.isSchemeMatch(url) && host === kQueueHasMessage
    }

    isBridgeLoadedURL(url) {
        var host = url.host && url.host.toLowerCase()
        return this.isSchemeMatch(url) && host === kBridgeLoaded
    }

    logUnkownMessage(url) {
        console.log(`${this.bridgeName}: WARNING: Received unknown ${this.bridgeName} command ${url.href}`)
    }

    webViewJavascriptCheckCommand() {
        return `typeof ${this.bridgeName} == \'object\';`
    }

    webViewJavascriptFetchQueyCommand() {
        return `${this.bridgeName}._fetchQueue();`
    }

    _disableJavscriptAlertBoxSafetyTimeout() {
        this.sendData(undefined,undefined,'_disableJavascriptAlertBoxSafetyTimeout')
    }

    _evaluateJavascript(js) {
        this.refs['webViewRef'].injectJavaScript(js)
    }

    _queueMessage(message){
        if(this.startupMessageQueue) {
            this.startupMessageQueue.push(message)
        } else {
            this._dispatchMessage(message)
        }
    }

    _dispatchMessage(message) {
        var messageJSON = JSON.stringify(message)
        var javascriptCommand = `${this.bridgeName}._handleMessageFromObjC('${messageJSON}');`;
        this._evaluateJavascript(javascriptCommand)    
    }

    onMessage(e) {//new message protocol
        if(this.props.onMessage) this.props.onMessage(e)
        if(e.nativeEvent.data) {
            var data = JSON.parse(e.nativeEvent.data);
            var url = new URL(data.url)
            if(url && this.isWebViewJavascriptBridgeURL(url)) {
                if(this.isBridgeLoadedURL(url)) {
                    this.injectJavascriptFile()
                } else if(this.isQueueMessageURL(url)) {
                    this.flushMessageQueue(data.messages)
                } else {
                    this.logUnkownMessage(url)
                }
            }
        }
    }

    onShouldStartLoadWithRequest(request) {//old message protocol
        var url = new URL(request.url)
        if(url && this.isWebViewJavascriptBridgeURL(url)) {
            if(this.isBridgeLoadedURL(url)) {
                this.injectJavascriptFile()
            } else if(this.isQueueMessageURL(url)) {
                this._evaluateJavascript(this.webViewJavascriptFetchQueyCommand())
            } else {
                this.logUnkownMessage(url)
            }
            return false;
        } else if(this.props.onShouldStartLoadWithRequest) {
            return this.props.onShouldStartLoadWithRequest(request)
        }
        return true;
    }

    render() {
        return (
            <WebView 
                {...this.props}
                originWhitelist= {[...this.props.originWhitelist,`${this.protocolScheme}://*`]}
                ref='webViewRef' 
                onMessage={this.onMessage.bind(this)}
                onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest.bind(this)}
            />
        );
    }
}