var WebViewJavascriptBridge_js = function(customProtocolScheme,bridgeName,callbacksName, injectBridgeJS) {

    

    var preprocessorJSCode = `
        (function() {

            //WebViewJavascriptBridge Code Start

            if (window.${bridgeName}) {
                return;
            }

            if (!window.onerror) {
                window.onerror = function(msg, url, line) {
                    console.log("${bridgeName}: ERROR:" + msg + "@" + url + ":" + line);
                }
            }
            window.${bridgeName} = {
                registerHandler: registerHandler,
                callHandler: callHandler,
                disableJavscriptAlertBoxSafetyTimeout: disableJavscriptAlertBoxSafetyTimeout,
                _fetchQueue: _fetchQueue,
                _handleMessageFromObjC: _handleMessageFromObjC
            };

            var messagingIframe;
            var sendMessageQueue = [];
            var messageHandlers = {};
            
            var CUSTOM_PROTOCOL_SCHEME = '${customProtocolScheme}';
            var QUEUE_HAS_MESSAGE = '__wvjb_queue_message__';
            
            var responseCallbacks = {};
            var uniqueId = 1;
            var dispatchMessagesWithTimeoutSafety = true;

            function registerHandler(handlerName, handler) {
                messageHandlers[handlerName] = handler;
            }
            
            function callHandler(handlerName, data, responseCallback) {
                if (arguments.length == 2 && typeof data == 'function') {
                    responseCallback = data;
                    data = null;
                }
                _doSend({ handlerName:handlerName, data:data }, responseCallback);
            }
            function disableJavscriptAlertBoxSafetyTimeout() {
                dispatchMessagesWithTimeoutSafety = false;
            }
            
            function _doSend(message, responseCallback) {
                if (responseCallback) {
                    var callbackId = 'cb_'+(uniqueId++)+'_'+new Date().getTime();
                    responseCallbacks[callbackId] = responseCallback;
                    message['callbackId'] = callbackId;
                }
                sendMessageQueue.push(message);
                
                _fetchQueue()
            }

            function _fetchQueue() {
                var messageObject = {
                    url : CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE,
                    messages : sendMessageQueue
                }
                var message = JSON.stringify(messageObject);
                sendMessageQueue = [];
                window.ReactNativeWebView.postMessage(message)
            }

            function _dispatchMessageFromObjC(messageJSON) {
                if (dispatchMessagesWithTimeoutSafety) {
                    setTimeout(_doDispatchMessageFromObjC);
                } else {
                    _doDispatchMessageFromObjC();
                }
                
                function _doDispatchMessageFromObjC() {
                    var message = JSON.parse(messageJSON);
                    var messageHandler;
                    var responseCallback;

                    if (message.responseId) {
                        responseCallback = responseCallbacks[message.responseId];
                        if (!responseCallback) {
                            return;
                        }
                        responseCallback(message.responseData);
                        delete responseCallbacks[message.responseId];
                    } else {
                        if (message.callbackId) {
                            var callbackResponseId = message.callbackId;
                            responseCallback = function(responseData) {
                                _doSend({ handlerName:message.handlerName, responseId:callbackResponseId, responseData:responseData });
                            };
                        }
                        
                        var handler = messageHandlers[message.handlerName];
                        if (!handler) {
                            console.log("${bridgeName}: WARNING: no handler for message from ObjC:", message);
                        } else {
                            handler(message.data, responseCallback);
                        }
                    }
                }
            }
            
            function _handleMessageFromObjC(messageJSON) {
                _dispatchMessageFromObjC(messageJSON);
            }

            _fetchQueue()

            registerHandler("_disableJavascriptAlertBoxSafetyTimeout", disableJavscriptAlertBoxSafetyTimeout);

            /************** Inject React Native APIs Start *************/
            // https://reactnative.dev/docs/
            ${injectBridgeJS}
            /************** Inject React Native APIs End *************/
            
            setTimeout(_callWVJBCallbacks, 0);
            function _callWVJBCallbacks() {
                var callbacks = window.${callbacksName};
                delete window.${callbacksName};
                for (var i=0; i<callbacks.length; i++) {
                    callbacks[i](${bridgeName});
                }
            }

            //WebViewJavascriptBridge Code End
        })();
    `;

    return preprocessorJSCode;
}

module.exports = WebViewJavascriptBridge_js;
