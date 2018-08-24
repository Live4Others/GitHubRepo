/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/message-service/message-service-factory.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/message-service/message-service-factory', [
	'ossui.messaging/message-service/portal-message-service',
	'ossui.messaging/message-service/client-message-service',
	'ossui.messaging/common/constants',
	'ossui.messaging/common/error-messages'
], function(PortalMessageService, ClientMessageService, constants, errorMessages) {

	/**
	 * Message service factory to construct:
	 * <ol>
	 * <li>A {@link PortalMessageService} created in the OSSUI Portal or a top level application that acts as such, coordinating messaging 
	 * between nested applications.</li>
	 * <li>A {@link ClientMessageService} created in each application that requires messaging services to communicate with other 
	 * applications and their components.</li>
	 * </ol>
	 * 
	 * It behaves as a singleton as the requirejs module that defines it returns an instance of this object.
	 * 
	 * @exports MessageServiceFactory
	 * @constructor
	 */
	var MessageServiceFactory = function() {

		var portalMessageService;
		var clientMessageService;
		var cache = [];

		/**
		 * Public API that can be used to construct a {@link PortalMessageService} or a {@link ClientMessageService}. Ensures a single 
		 * instance of the requested message service is provided.
		 * 
		 * @param {string} mode Defines the type of message service to be constructed depending on whether the messasge service should act as a 
		 * portal or a client of the portal. The valid values are:
		 * <ol>
		 * <li>portal</li>
		 * <li>client</li>
		 * </ol>
		 * @param {Object} [options] The options to use
		 * @param {string} [options.targetUrl] Only used when the mode is 'client'. The URL of the window that created the frame containing the client message
		 * service.
		 * @param {string} [options.targetWindow] Only used when the mode is 'client'. A window reference for the window that created the frame containing the
		 * client message service.
		 * @param {number} [options.responseTimeout] Only used when the mode is 'portal'. Timeout for long running responses.
		 * @throws {Error} If the mode value is invalid.
		 */
		this.createMessageService = function(mode, options) {
			var _options = options || {};
			if(mode === constants.MODE_PORTAL) {
				if (typeof portalMessageService === 'undefined') {
					portalMessageService = new PortalMessageService(_options.responseTimeout);
					return portalMessageService;
				} else {
					return portalMessageService;
				}
			} else if(mode === constants.MODE_CLIENT) {
				return this._cacheClientMessageService(_options);
			} else {
				throw new Error(errorMessages.ERROR_INVALID_MESSAGE_SERVICE_MODE + mode);
			}
		};
		
		/**
		 * Return single instance of {@link ClientMessageService} per option (targetUrl and targetWindow)
		 * @param {Object} [option] The options to use
		 * @returns {Object} [clientMessageService] {@link ClientMessageService}
		 */
		this._cacheClientMessageService = function(option) {
			var clientMessageService = this._findCache(option);
			if(!clientMessageService) {
				var cacheObject = this._cacheObject(option);
				cache.push(cacheObject);
				clientMessageService = cacheObject.clientMessageService; 
			}
			
			return clientMessageService;
		};
		
		/**
		 * Tries to locate {@link ClientMessageService} in cache based on option. It returns null otherwise.
		 * @param {Object} [option] The options to use
		 * @returns {Object} [clientMessageService] {@link ClientMessageService}
		 */
		this._findCache = function(option) {
			for(var i = 0; i < cache.length; i++) {
				var obj = cache[i];
				if(obj.targetUrl === option.targetUrl && obj.targetWindow === option.targetWindow) {
					return obj.clientMessageService;
				}
			}
			return null;
		};
		
		/**
		 * Returns a new cache object.
		 * @param {Object} [option] The options to use
		 * @returns {Object} [cacheObject] an object containing cache info.
		 */
		this._cacheObject = function(option) {
			return {
				targetUrl : option.targetUrl,
				targetWindow : option.targetWindow,
				clientMessageService : new ClientMessageService(option.targetUrl, option.targetWindow)
			};
		};
	};

	return new MessageServiceFactory();
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/common/constants.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/common/constants', [
], function() {

	/**
	 * Constants object that provides properties across messaging components.
	 * 
	 * It behaves as a singleton as the requirejs module that defines it returns an instance of this object.
	 * 
	 * @exports Constants
	 * @constructor
	 */
	var Constants = function() {
		return {
			MODE_PORTAL : 'portal',
			MODE_CLIENT : 'client',
			MESSAGE_DIRECTION_PORTAL : 'portal',
			MESSAGE_DIRECTION_CHILDREN : 'children',
			MESSAGE_TYPE_ADD_RESPONSE : 'add-response',
			MESSAGE_TYPE_REQUEST : 'request',
			MESSAGE_TYPE_RESPONSE : 'response',
			RESPONSE_STATUS_SUCCESS : 'success',
			RESPONSE_STATUS_ERROR : 'error',
			MESSAGE_TYPE_PUBLISH : 'publish',
			MESSAGE_TYPE_SUBSCRIBE : 'subscribe',
			MESSAGE_TYPE_UNSUBSCRIBE : 'unsubscribe',
			MESSAGE_TYPE_UNSUBSCRIBE_ALL : 'unsubscribe-all',
			TOPIC_ANY : 'any',
			AUDIENCE_INTERNAL : 'internal',
			AUDIENCE_EXTERNAL : 'external',
			AUDIENCE_ALL : 'all',
			MESSAGE_EVENT_LISTENER_TYPE : 'message',
			NO_RESPONSE_TIMEOUT : 'no-timeout'
		};
	};

	return new Constants();
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/common/error-messages.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/common/error-messages', [
], function() {

	/**
	 * ErrorMessages object that provides error messages that are used across messaging components.
	 * 
	 * It behaves as a singleton as the requirejs module that defines it returns an instance of this object.
	 * 
	 * @exports ErrorMessages
	 * @constructor
	 */
	var ErrorMessages = function () {
		var ERROR_OSSUI_MESSAGING = 'OSSUI messaging error. ';
		return {
			ERROR_STRINGIFY_PAYLOAD : ERROR_OSSUI_MESSAGING + 'Error stringifying message for post',
			ERROR_PARSE_PAYLOAD : ERROR_OSSUI_MESSAGING + 'Error parsing message',
			ERROR_INVALID_ARGUMENTS : ERROR_OSSUI_MESSAGING + 'Invalid arguments',
			ERROR_POST_MESSAGE : ERROR_OSSUI_MESSAGING + 'Failed to post the message',
			ERROR_INVALID_MESSAGE_SERVICE_MODE : ERROR_OSSUI_MESSAGING + 'Invalid argument, MessageService mode not known: ',
			ERROR_PORTAL_POST_REQUEST : ERROR_OSSUI_MESSAGING + 'Failed to post this request from the Portal: ',
			ERROR_RESPONSE_TIMEOUT : ERROR_OSSUI_MESSAGING + 'Response timeout',
			ERROR_PORTAL_POST_RESPONSE : ERROR_OSSUI_MESSAGING + 'Failed to post response from the portal',
			ERROR_HANDLE_RESPONSE : ERROR_OSSUI_MESSAGING + 'Failed to handle the response to a request',
			ERROR_RESPONSE_FAILURE : ERROR_OSSUI_MESSAGING + 'Failed to generate a response',
			ERROR_NO_RESPONDER_FOUND : ERROR_OSSUI_MESSAGING + 'Failed to find responder to a request'
		};
	};

	return new ErrorMessages();
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/common/message-utils.js#2 $
 * $DateTime: 2017/06/16 12:56:00 $
 * $Revision: #2 $
 * $Change: 1846588 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/common/message-utils', [
	'ossui.messaging/common/constants',
	'ossui.messaging/common/error-messages'
], function(constants, errorMessages) {

	/**
	 * MessageUtils object that provides utilities to post and format messages before using postMessage to
	 * post messages between iFrames.
	 *
	 * It behaves as a singleton as the requirejs module that defines it returns an instance of this object.
	 *
	 * @exports MessageUtils
	 * @constructor
	 */
	var MessageUtils = function() {

		/**
		 * Posts a message using postMessage.
		 *
		 * @param windowRef Reference to the window generating the subscription request.
		 * @param payload Includes the message to be posted.
		 * @param windowUrl URL of the window generating the subscription request.
		 */
		this.post = function(windowRef, payload, windowUrl) {
            var message;
            try{
			    message = this.stringifyMessage(payload);
            }catch(error){
                //if stringify msg fails then post to parent window will fail,
                //hence this message is not sent to parent window frame 
                console.log(errorMessages.ERROR_POST_MESSAGE + ': Reason: ' + error.message);
            }
			try {
				if(typeof message !== 'undefined' && message !== null) {
					windowRef.postMessage(message, windowUrl);
				}
			} catch(err) {
				//console.log(errorMessages.ERROR_POST_MESSAGE + ': ' + err);
				throw new Error(errorMessages.ERROR_POST_MESSAGE + ': ' + err);
			}
		};

		/**
		 * Adds an event listener to the window listening for messages of type 'message'
		 * and attaches a listener function to the event.
		 *
		 * @param listener function to execute when event is triggered.
		 */
		this.addListener = function(listener) {
			if (window.addEventListener){
				window.addEventListener(constants.MESSAGE_EVENT_LISTENER_TYPE, listener, false);
			} else if (window.attachEvent){
				window.attachEvent(constants.MESSAGE_EVENT_LISTENER_TYPE, listener);
			}
		};

		/**
		 * Converts a payload into a JSON string object before posting.
		 *
		 * @param payload Object literal containing message to be posted.
		 */
		this.stringifyMessage = function(payload) {
			try {
				return JSON.stringify(payload);
			} catch(err) {
				//console.log(errorMessages.ERROR_STRINGIFY_PAYLOAD + ': ' + err);
				throw new Error(errorMessages.ERROR_STRINGIFY_PAYLOAD + ': ' + err);
			}
		};

		/**
		 * Converts a payload from a JSON string object into a object literal after it is received
		 * by post.
		 *
		 * @param payload JSON string object containing message to be posted.
		 */
		this.parseMessage = function(payload) {
			try {
				return JSON.parse(payload);
			} catch(err) {
				//console.log(errorMessages.ERROR_PARSE_PAYLOAD + ': ' + err);
				throw new Error(errorMessages.ERROR_PARSE_PAYLOAD + ': ' + err);
			}
		};

		/**
		 * Converts a given url string into a format that is used when using postMessage.
		 * Format e.g. is http://<host>:<port>
		 *
		 * @param url
		 */
		this.getTargetUrl = function(url) {
			var protocol, host, port, splitUrl, splitHostPort,
				targetUrl = '';

			if(typeof url !== 'undefined' && url !== null && url !== "") {
				splitUrl = url.split('/');
				if(splitUrl && splitUrl.length >= 3) {
					protocol = splitUrl[0];
					splitHostPort = splitUrl[2].split(':');

					if (splitHostPort && splitHostPort.length === 2) {
						host = splitHostPort[0];
						port = splitHostPort[1];
					}
					else {
						host = splitUrl[2];
					}
				}
				targetUrl =  protocol + '//' + host;
				if(typeof port !== 'undefined') {
					targetUrl = targetUrl + ':' + port;
				}
			}

			return targetUrl;
		};
	};

	return new MessageUtils();
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/common/utils.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/common/utils', [
], function() {

	/**
	 * Utils object that provides general utilities that are used across messaging components.
	 * 
	 * It behaves as a singleton as the requirejs module that defines it returns an instance of this object.
	 * 
	 * @exports Utils
	 * @constructor
	 */
	var Utils = function() {

		/**
		 * Generates and returns a unique id that can be used to identify a request or message.
		 */
		this.getUniqueId = function() {
			// Generate four random hex digits.
			var S4 = function S4() {
				return (((1+Math.random())*0x10000)||0).toString(16).substring(1);
			};

			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		};

		/**
		 * Tests to see if a given object is empty
		 * 
		 * @param object
		 */
		this.isEmptyObject = function(obj) {
			for (var key in obj) {
				if (hasOwnProperty.call(obj, key)) {
					return false;
				}
			}
			return true;
		};

		/**
		 * Sets a given function to execute asynchronously within a given timeout period.
		 * 
		 * @param fn function to execute asynchronously.
		 * @param timeout spcified when to timeout execution of the function.
		 */
		this.async = function async (fn, timeout) {
			setTimeout(fn, timeout);
		};
	};

	return new Utils();
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/message-service/base-message-service.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/message-service/base-message-service', [
	'ossui.messaging/publish/publisher/publisher',
	'ossui.messaging/common/constants',
	'ossui.messaging/common/error-messages'
], function(Publisher, constants, errorMessages) {

	/**
	 * Base message service object that provides common features inherited by the portal and client message services.
	 * 
	 * @exports BaseMessageService
	 * @constructor
	 */
	var BaseMessageService = function() {

		/** @property Manages internal publish/subscribe services */
		this.publisher = new Publisher();
		/** @property Manages publish/subscribe activities across windows/iframes */
		this.windowPublisher = {};
		/** @property Manages request/response services */
		this.responder = {};

		/**
		 * Publishes a message to all subscribers of a topic.
		 * 
		 * @param message The message to be published. This can be as simple as a String object or a richly structured payload 
		 * such as a stringyfied JSON object.
		 * @param topic The name of the topic for which the message is being published.
		 * @param audience Optional parameter.
		 * <ol>
		 *   <li>all - Default value if none provided. The message is distributed internally to subscribers within the same window and also
		 *       to external subscribers in other windows/frames.</li>
		 *   <li>internal - The message is distributed internally to subscribers within the same window.</li>
		 *   <li>external - The message is distributed externally to subscribers in other windows/iframes.</li>
		 * </ol>
		 */
		this.publish = function(message, topic, audience) {
			this.audience = audience || constants.AUDIENCE_ALL;

			if (this.audience === constants.AUDIENCE_INTERNAL) {
				this.publisher.publish(message, topic);

			} else if (this.audience === constants.AUDIENCE_EXTERNAL) {
				this.windowPublisher.publish(message, topic);

			} else if (this.audience === constants.AUDIENCE_ALL) {
				this.publisher.publish(message, topic);
				this.windowPublisher.publish(message, topic);
			}
		};

		/**
		 * Allows a component to register a response handler for a request type.
		 * 
		 * @param responseHandler Function that will be executed by the message service when a request is raised. The response handler
		 * function should accept two parameters:
		 * <ol>
		 *   <li>messagingCallback - This is the messaging callback that must be invoked by the response handler to communicate back the 
		 *   response to the request. The messaging callback accepts a single parameter for the contents of the response.</li>
		 *   <li>value - Optional payload provided as part of the request that may be used by the response handler to provide a response.</li>
		 * </ol>
		 * The responseHandler should throw an Exception with a suitable message if there are any errors in the generation of a response.
		 * @param request Identifies the request for which the response handler will provide a response.
		 */
		this.addResponseHandler = function(responseHandler, request) {
			this.responder.addResponseHandler(responseHandler, request);
		};

		/**
		 * Issues a request message.
		 * 
		 * @param [requestHandlers.success] Function that handles a successful request. Accepts a parameter for the response.
		 * @param [requestHandlers.error] Function that handles a request failure. Accepts a parameter for the response error.
		 * @param request Name of the type of request.
		 * @param data Optional data provided as part of the request.
		 */
		this.request = function(requestHandlers, request, data) {
			this.responder.request(requestHandlers, request, data);
		};

		/**
		 * Private utility function to validate the arguments provided for the construction of a message service.
		 * 
		 * @param args The arguments provided to construct the message service.
		 * @param numberOfArgumentsExpected The number of arguments expected by the message service being constructed.
		 */
		this._validateOptions = function(args, numberOfArgumentsExpected) {
			if (args.length === 0 || args.length < numberOfArgumentsExpected) {
				throw new Error(errorMessages.ERROR_INVALID_ARGUMENTS);
			}

			for(var i = 0, l = args.length; i < l; i++) {
				if (typeof args[i] === 'undefined' || args[i] === null) {
					throw new Error(errorMessages.ERROR_INVALID_ARGUMENTS + ', argument at ' + i + ' = ' + args[i]);
				}
			}
		};
	};

	return BaseMessageService;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/message-service/client-message-service.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/message-service/client-message-service', [
	'ossui.messaging/message-service/base-message-service',
	'ossui.messaging/publish/window-publisher/client-window-publisher',
	'ossui.messaging/respond/client-responder'
], function(BaseMessageService, ClientWindowPublisher, ClientResponder) {

	/**
	 * Client messaging service to support communication between application components. 
	 * It provides publish/subscribe and request/response APIs.
	 * Requires the presence of a {@link PortalMessageService} that coordinates the communication between applications.
	 * 
	 * @exports ClientMessageService
	 * @constructor
	 * @augments BaseMessageService
	 */
	var ClientMessageService = function (targetUrl, targetWindow) {

		// Extend the base message service
		BaseMessageService.apply(this, arguments);

		this._validateOptions(arguments, 2);

		// Manages publish/subscribe activities across windows/iframes
		this.windowPublisher = new ClientWindowPublisher(targetUrl, targetWindow, this);
		// Manages request/response services
		this.responder = new ClientResponder(targetUrl, targetWindow);

		/**
		 * Subscribes a handler function to a topic.
		 * 
		 * @param messageHandler Handler function for the topic. Should accept a single parameter for the published message.
		 * @param topic Name of the subscription topic.
		 */
		this.subscribe = function(messageHandler, topic) {
			this.publisher.subscribe(messageHandler, topic);
			this.windowPublisher.subscribe(topic);
		};

		/**
		 * Unsubscribes a handler function from a topic.
		 * 
		 * @param messageHandler Handler function that will be removed from the provided topic.
		 * @param topic Name of the topic from which to unsubscribe.
		 */
		this.unsubscribe = function(messageHandler, topic) {
			this.publisher.unsubscribe(messageHandler, topic, this.windowPublisher.unsubscribe);
			//this.windowPublisher.unsubscribe(topic);
		};
		
		/**
		 * Unsubscribes all registered topics for the client.
		 * This should be called by the client window before it gets closed and will never be used again.
		 */
		this.unsubscribeAll = function(){
		    this.windowPublisher.unsubscribeAll();
		};
	};

	// Extend the base message service
	ClientMessageService.prototype = new BaseMessageService();

	return ClientMessageService;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/message-service/portal-message-service.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/message-service/portal-message-service', [
	'ossui.messaging/message-service/base-message-service',
	'ossui.messaging/publish/window-publisher/portal-window-publisher',
	'ossui.messaging/respond/portal-responder'
], function(BaseMessageService, PortalWindowPublisher, PortalResponder) {

	/**
	 * Portal messaging service to coordintate communication between application components. 
	 * It provides publish/subscribe and request/response APIs.
	 * 
	 * @exports PortalMessageService
	 * @constructor
	 *   @param responseTimeout Time in miliseconds to wait for a response to be provided.
	 * @augments BaseMessageService
	 */
	var PortalMessageService = function (responseTimeout) {

		BaseMessageService.apply(this, arguments);

		this.windowPublisher = new PortalWindowPublisher(this);
		this.responder = new PortalResponder(responseTimeout);

		/**
		 * Subscribes a handler function to a topic.
		 * 
		 * @param messageHandler Handler function for the topic.
		 * @param topic Name of the subscription topic.
		 */
		this.subscribe = function(messageHandler, topic) {
			this.publisher.subscribe(messageHandler, topic);
		};

		/**
		 * Unsubscribes a handler function from a topic.
		 * 
		 * @param messageHandler Handler function that will be removed from the provided topic.
		 * @param topic Name of the topic from which to unsubscribe.
		 */
		this.unsubscribe = function(messageHandler, topic) {
			this.publisher.unsubscribe(messageHandler, topic);
		};
	};

	PortalMessageService.prototype = new BaseMessageService();

	return PortalMessageService;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/publish/publisher/publisher.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/publish/publisher/publisher', [
	'ossui.messaging/common/constants'
], function(constants) {

	/**
	 * Provides topic based publish, subscribe and unsubscribe services.
	 * This is intended for internal use and the services it provides should only be accessed via the MessageServiceFactory.
	 * 
	 * @exports Publisher
	 * @constructor
	 */
	var Publisher = function Publisher() {

		var self = this;

		this.subscribers = {
			any : []
		};

		/**
		 * Subscribes a handler function to a topic. If no topic is provided the subscribtion is assigned to the 'any' topic.
		 * 
		 * @param fn Handler function for the topic.
		 * @param topic Name of the subscription topic.
		 */
		this.subscribe = function(fn, topic) {
			topic = topic || constants.TOPIC_ANY;
			if(typeof this.subscribers[topic] === 'undefined') {
				this.subscribers[topic] = [];
			}
			this.subscribers[topic].push(fn);
		};

		/**
		 * Publishes a message to all subscribers of a topic.
		 * Results in the asynchronous execution of all handler functions subscribed to the topic with the provided message.
		 * 
		 * @param message An object representing the message to be published.
		 * @param topic Name of the subscription topic.
		 */
		this.publish = function(message, topic) {
			// make asynchronous
			setTimeout(function() {
				_visitSubscribers(constants.MESSAGE_TYPE_PUBLISH, message, topic);
			}, 0);
		};

		/**
		 * Unsubscribes a handler function from a topic.
		 * 
		 * @param fn Handler function that will be removed from the provided topic.
		 * @param topic Name of the topic from which to unsubscribe.
		 */
		this.unsubscribe = function(fn, topic, callbackFn) {
			// make asynchronous
			setTimeout(function() {
				_visitSubscribers(constants.MESSAGE_TYPE_UNSUBSCRIBE, fn, topic, callbackFn);
			}, 0);
		};

		/**
		 * Check existing subscription for a topic.
		 * 
		 * @param topic Name of the topic from which to unsubscribe.
		 * @return true if subscriptions are present for given topic else false.
		 */
		this.hasSubscriptionForTopic = function(topic){
			var pubtype = topic || constants.TOPIC_ANY;
			var subscribers = self.subscribers[pubtype];
			if(subscribers && subscribers.length > 0){
				return true;
			}
			return false;
		};

		/**
		 * Visit subscribers when publishing a message or when unsubscribing from a topic
		 * 
		 * @param action The type of action to be performed, either 'publish' or 'unsubscribe'.
		 * @param arg When the action is 'publish' this is the message to be passed into the subscribing handler function . When the action 
		 * is 'unsubscribe' this is the handler function to be removed from the topic.
		 * @param topic Name of topic to which to publish or from which to unsubscribe.
		 */
		var _visitSubscribers = function(action, arg, topic, callbackFn) {
			var pubtype = topic || constants.TOPIC_ANY,
			subscribers = self.subscribers[pubtype],
			i,
			max = typeof subscribers !== 'undefined' ? subscribers.length : 0;

			for (i = 0; i < max; i += 1) {
				if (action === constants.MESSAGE_TYPE_PUBLISH) {
					subscribers[i](arg);
				} else if (action === constants.MESSAGE_TYPE_UNSUBSCRIBE) {
					if (subscribers[i] === arg) {
						subscribers.splice(i, 1);
					}
				}
			}
			if (action === constants.MESSAGE_TYPE_UNSUBSCRIBE) {
				if(!self.hasSubscriptionForTopic(topic) && callbackFn){
					callbackFn(topic);
				}
			}
		};
	};

	return Publisher;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/publish/window-publisher/base-window-publisher.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/publish/window-publisher/base-window-publisher', [
	'ossui.messaging/common/constants',
	'ossui.messaging/common/error-messages',
	'ossui.messaging/common/utils',
	'ossui.messaging/common/message-utils'
], function(constants, errorMessages, utils, messageUtils) {

	/**
	 * Base class providing support for publish/subscribe messaging between application components running in other windows/iframes.
	 * 
	 * @exports BaseWindowPublisher
	 * @constructor
	 */
	var BaseWindowPublisher = function() {

		var windowPublisherId = utils.getUniqueId();

		this.subscriberWindows = {};
		this.messageService = {};

		var self = this;

		/**
		 * Publishes to all registered windows that have subscribed to a particular topic.
		 * 
		 * @param payload Includes the topic and the content to be published.
		 */
		this.publishToChildWindowSubscribers = function(payload) {
			var topic = payload.topic;

			var registeredSubscriberWindows = self.subscriberWindows[topic];

			if(typeof registeredSubscriberWindows === 'undefined') {
				return;
			}

			payload.target = constants.MESSAGE_DIRECTION_CHILDREN;

			for(var i = 0; i < registeredSubscriberWindows.length; i++) {
				var childWindow = registeredSubscriberWindows[i].windowRef;
				var childWindowUrl = registeredSubscriberWindows[i].windowUrl;
				messageUtils.post(childWindow, payload, childWindowUrl);
			}
		};

		/**
		 * Registers a window subscription to the given topic if the subscription is not already present.
		 * 
		 * @param topic The topic to which the window wishes to subscribe.
		 * @param windowRef Reference to the window generating the subscription request.
		 * @param windowUrl URL of the window generating the subscription request.
		 * @returns {boolean} true if the registration was processed, i.e. the subscription is not duplicate.
		 */
		this.registerSubscription = function(topic, windowRef, windowUrl) {
			if(this.isRegistered(topic, windowRef, windowUrl)) {
				return false;
			}

			if (typeof this.subscriberWindows[topic] === 'undefined') {
				this.subscriberWindows[topic] = [];
			}
			this.subscriberWindows[topic].push({windowRef : windowRef, windowUrl : windowUrl});
			return true;
		};

		/**
		 * Publishes a message internally to all window components that have subscribed to the provided topic.
		 * 
		 * @param payload Contains the message to be published and the topic.
		 */
		this.publishInternally = function(payload) {
			this.messageService.publish(payload.message, payload.topic, constants.AUDIENCE_INTERNAL);
		};

		/**
		 * Unsubscribes a window internally from a topic.
		 * 
		 * @param topic The topic from which the window whishes to unsubscribe.
		 * @param windowRef Reference to the window generating the unsubscription request.
		 */
		this.unsubscribeInternally = function(topic, windowRef) {
			var subscriberWindows = this.subscriberWindows[topic],
			max = typeof subscriberWindows !== 'undefined' ? subscriberWindows.length : 0;

			for (i = 0; i < max; i += 1) {
				if (typeof subscriberWindows[i] !== 'undefined' && subscriberWindows[i].windowRef === windowRef) {
					subscriberWindows.splice(i, 1);
				}
			}

			this.deleteUnsubscribedTopic(topic);
		};
		
		/**
		 * Unsubscribes all registered topics for given window.		 * 
		 */
		this.unsubscribeAllTopicsInternally = function(windowRef){
		    for(var topic in this.subscriberWindows){
		        var subscriberWindows = this.subscriberWindows[topic];
		        for(var i = 0; i < subscriberWindows.length; i++){
		            if (typeof subscriberWindows[i] !== 'undefined' && subscriberWindows[i].windowRef === windowRef) {
	                    subscriberWindows.splice(i, 1);
	                }
		        }
		        this.deleteUnsubscribedTopic(topic);
		    }
		};

		/**
		 * Getter for the id of this window publisher instance.
		 */
		this.getWindowPublisherId = function() {
			return windowPublisherId;
		};

		/**
		 * Returns true if the registration is already present in the subscription list.
		 *
		 * @param topic The topic to which the window wishes to subscribe.
		 * @param windowRef Reference to the window generating the subscription request.
		 * @param windowUrl URL of the window generating the subscription request.
		 * @returns {boolean} true if the registration is already present in the subscription list.
		 */
		this.isRegistered = function(topic, windowRef, windowUrl) {
			var windowSubscriptions = this.subscriberWindows[topic];
			if(typeof windowSubscriptions !== 'undefined' && windowSubscriptions !== null && windowSubscriptions.length !== 0) {
				for(var i = 0, l = windowSubscriptions.length; i < l; i++) {
					if(windowSubscriptions[i].windowRef === windowRef && windowSubscriptions[i].windowUrl === windowUrl) {
						return true;
					}
				}
			}
			return false;
		};

		/**
		 * Removes a topic from the subscription list if it is not longer subscribed.
		 *
		 * @param topic The name of the topic.
		 */
		this.deleteUnsubscribedTopic = function (topic) {
			if (typeof this.subscriberWindows[topic] !== 'undefined' && this.subscriberWindows[topic].length === 0) {
				delete this.subscriberWindows[topic];
			}
		};
	};

	return BaseWindowPublisher;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/publish/window-publisher/client-window-publisher.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/publish/window-publisher/client-window-publisher', [
	'ossui.messaging/publish/window-publisher/base-window-publisher',
	'ossui.messaging/common/constants',
	'ossui.messaging/common/message-utils'
], function(BaseWindowPublisher, constants, messageUtils) {

	/**
	 * Provides the {@link ClientMessageService} with functionality to receive and post messages using the postMessage web API.
	 *
	 * In messaging terms, client windows can be arranged hierarchically with a portal window at the top of the hierarchy. Within this 
	 * hierachy messages can be propagated:
	 * <ul>
	 * <li>upwards to another ClientWindowPublisher instance.</li>
	 * <li>upwards to the {@link PortalWindowPublisher} when the ClientWindowPublisher is a direct client of the Portal.</li>
	 * <li>downwards to any registered ClientWindowPublisher instances.</li>
	 * </ul>
	 *
	 * @exports ClientWindowPublisher
	 * @constructor
	 *   @param targetUrl URL of the window with which the ClientWindowPublisher communicates upwards.
	 *   @param targetWindow Object reference for the window with which the ClientWindowPublisher communicates upwards.
	 *   @param messageService Reference to the ClientMessageService that created an instance of the ClientWindowPublisher.
	 * @augments BaseWindowPublisher
	 */
	var ClientWindowPublisher = function(targetUrl, targetWindow, messageService) {

		BaseWindowPublisher.apply(this, arguments);
		this.targetWindow = targetWindow || window.parent;
		this.messageService = messageService;

		var self = this;

		/**
		 * Publishes a message to other windows/iframes using the postMessage web API.
		 * The message is directed updwards towards the portal.
		 * 
		 * @param message The message to be published.
		 * @param topic The name of the topic.
		 */
		this.publish = function(message, topic) {
			var payload = {
					target : constants.MESSAGE_DIRECTION_PORTAL,
					origin : this.getWindowPublisherId(),
					messageType : constants.MESSAGE_TYPE_PUBLISH,
					topic : topic,
					message : message
			};

			messageUtils.post(this.targetWindow, payload, targetUrl);
		};

		/**
		 * Issues a subscription message to other windows/iframes using the postMessage web API.
		 * The message is directed updwards towards the portal.
		 * 
		 * @param topic The name of the topic.
		 */
		this.subscribe = function(topic) {
			var payload = {
					target : constants.MESSAGE_DIRECTION_PORTAL,
					origin : this.getWindowPublisherId(),
					messageType : constants.MESSAGE_TYPE_SUBSCRIBE,
					topic : topic
			};

			messageUtils.post(this.targetWindow, payload, targetUrl);
		};

		/**
		 * Issues an unsubscribe message to other windows/iframes using the postMessage web API.
		 * The message is directed upwards towards the portal.
		 * 
		 * @param topic The name of the topic.
		 */
		this.unsubscribe = function(topic) {
			var payload = {
					target : constants.MESSAGE_DIRECTION_PORTAL,
					origin : self.getWindowPublisherId(),
					messageType : constants.MESSAGE_TYPE_UNSUBSCRIBE,
					topic : topic
			};

			messageUtils.post(self.targetWindow, payload, targetUrl);
		};

		/**
		 * Removes all subscribed topics for the window and issues unsubscribeAll message to
		 * other windows/iframes using the postMessage web API.
		 * The message is directed upwards to the portal.
		 */
		this.unsubscribeAll = function(){
		    for(var topic in this.subscriberWindows){
                this.subscriberWindows[topic] = [];                        
                this.deleteUnsubscribedTopic(topic);
            }
		    var payload = {
                    target : constants.MESSAGE_DIRECTION_PORTAL,
                    origin : this.getWindowPublisherId(),
                    messageType : constants.MESSAGE_TYPE_UNSUBSCRIBE_ALL,
            };

            messageUtils.post(this.targetWindow, payload, targetUrl);
		};
		/**
		 * Message event listener that handles messages from other windows/iframes.
		 * Determines the direction the message is travelling, either towards the Portal or towards other child client windows, and calls 
		 * the appropriate function to handle the message.
		 * 
		 * @param {Object} event The event object for the message listener. Contains the message content and information describing the origin of 
		 * the message.
		 */
		this.listener = function(event) {
			var payload = '';
			try {
				payload = messageUtils.parseMessage(event.data);
			} catch(err) {
				throw err;
			}

			var windowRef = event.source,
				windowUrl = event.origin;

			if (payload.target === constants.MESSAGE_DIRECTION_PORTAL) {
				self.portalBoundMessageHandler(payload, windowRef, windowUrl);
			}
			else if (payload.target === constants.MESSAGE_DIRECTION_CHILDREN) {
				self.childrenBoundMessageHandler(payload);
			}
		};

		/**
		 * Handles messages that need to be propagated towards the portal.
		 * 
		 * Accepts the following message types:
		 * <ol>
		 *   <li>subscribe - registers the subscription and propagates towards the portal if the registration happened</li>
		 *   <li>publish - propagates the message towards the portal</li>
		 *   <li>unsubscribe - unregisters the subscription and if the topic propagates towards the portal (only if the topic is not subscribed to by any other
		 *   windows.</li>
		 *   <li>unsubscribeAll - unregisters all topics for the referenced window.</li>
		 * </ol>
		 * 
		 * @param payload Message content.
		 * @param windowRef Reference to the window generating the message.
		 * @param windowUrl URL of the window generating the message.
		 */
		this.portalBoundMessageHandler = function(payload, windowRef, windowUrl) {
			if (payload.messageType === constants.MESSAGE_TYPE_SUBSCRIBE) {
				if(self.registerSubscription(payload.topic, windowRef, windowUrl)){
					self.subscribe(payload.topic);
				}
			}
			if (payload.messageType === constants.MESSAGE_TYPE_PUBLISH) {
				messageUtils.post(this.targetWindow, payload, targetUrl);
			}
			if (payload.messageType === constants.MESSAGE_TYPE_UNSUBSCRIBE) {
				self.unsubscribeInternally(payload.topic, windowRef);

				if(!this.activeTopic(payload.topic)) {
					self.unsubscribe(payload.topic);
				}
			}
			if (payload.messageType === constants.MESSAGE_TYPE_UNSUBSCRIBE_ALL) {
                self.unsubscribeAllTopicsInternally(windowRef);
            }
		};

		/**
		 * Handles publish messages and performs the followin actions:
		 * <ol>
		 *   <li>propagates the publish message to child client windows.</li>
		 *   <li>if the message originated from another window it publishes the message to internal components within the window.</li>
		 * </ol>
		 * 
		 * @param payload Message content to be published.
		 */
		this.childrenBoundMessageHandler = function(payload) {
			if (payload.messageType === constants.MESSAGE_TYPE_PUBLISH) {
				this.publishToChildWindowSubscribers(payload);

				if (payload.origin !== this.getWindowPublisherId()) {
					this.publishInternally(payload);
				}
			}
		};

		/**
		 * Returns true if the topic is in the list of subscriptions.
		 *
		 * @param topic The name of the topic.
		 * @returns {boolean} true if the topic is in the list of subscriptions.
		 */
		this.activeTopic = function(topic) {
			return typeof this.subscriberWindows[topic] !== 'undefined' && this.subscriberWindows[topic].length !== 0;
		};

		messageUtils.addListener(this.listener);
	};

	ClientWindowPublisher.prototype = new BaseWindowPublisher();

	return ClientWindowPublisher;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/publish/window-publisher/portal-window-publisher.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/publish/window-publisher/portal-window-publisher', [
	'ossui.messaging/publish/window-publisher/base-window-publisher',
	'ossui.messaging/common/constants',
	'ossui.messaging/common/message-utils'
], function(BaseWindowPublisher, constants, messageUtils) {

	/**
	 * Provides the {@link PortalMessageService} with functionality to receive and post messages using the postMessage web API.
	 * 
	 * In messaging terms, the portal sits at the top of a hierarchy of client windows/iframes and distributes messages to the appropriate 
	 * client.
	 * 
	 * @exports PortalWindowPublisher
	 * @constructor
	 *   @param messageService Reference to the PortalMessageService that created an instance of the PortalWindowPublisher.
	 * @augments BaseWindowPublisher
	 */
	var PortalWindowPublisher = function PortalWindowPublisher(messageService) {

		BaseWindowPublisher.apply(this, arguments);

		this.messageService = messageService;
		var self = this;

		/**
		 * Publishes a message to child windows/iframes that have subscribed to the given topic.
		 * 
		 * @param message The message to be published.
		 * @param topic The name of the topic for which the message is being published.
		 */
		this.publish = function(message, topic) {
			var payload = {
					target : constants.MESSAGE_DIRECTION_CHILDREN,
					origin : this.getWindowPublisherId(),
					messageType : constants.MESSAGE_TYPE_PUBLISH,
					topic : topic,
					message : message
			};

			self.publishToChildWindowSubscribers(payload);
		};

		/**
		 * Message event listener that handles messages from other windows/iframes. Parses the message and invokes the message handler.
		 * 
		 * @param {Object} event The event object for the message listener. Contains the message content and information describing the origin of 
		 * the message.
		 */
		this.listener = function(event) {
			var payload = '';
			try {
				payload = messageUtils.parseMessage(event.data);
			} catch(err) {
				throw err;
			}

			var windowRef = event.source,
				windowUrl = event.origin;

			if (payload.target === constants.MESSAGE_DIRECTION_PORTAL) {
				self.messageHandler(payload, windowRef, windowUrl);
			}
		};

		/**
		 * Handles the following types of messages:
		 * <ol>
		 *   <li>subscribe - registers the subscription</li>
		 *   <li>publish - publishes the message internally to components within the Portal and propagates the message to any clients 
		 *                 that have subscribed to the published topic.</li>
		 *   <li>unsubscribe - unregisters the specified topic from the client's subscription</li>
		 *   <li>unsubscribeAll - unregisters all of the client's subscription</li>
		 * </ol>
		 * 
		 * @param payload Message content.
		 * @param windowRef Reference to the window generating the message.
		 * @param windowUrl URL of the window generating the message.
		 */
		this.messageHandler = function(payload, windowRef, windowUrl) {
			if (payload.messageType === constants.MESSAGE_TYPE_SUBSCRIBE) {
				this.registerSubscription(payload.topic, windowRef, windowUrl);
			}
			if (payload.messageType === constants.MESSAGE_TYPE_PUBLISH) {
				this.publishInternally(payload);

				this.publishToChildWindowSubscribers(payload);
			}
			if (payload.messageType === constants.MESSAGE_TYPE_UNSUBSCRIBE) {
				this.unsubscribeInternally(payload.topic, windowRef);
			}
			if (payload.messageType === constants.MESSAGE_TYPE_UNSUBSCRIBE_ALL) {
                this.unsubscribeAllTopicsInternally(windowRef);
            }
		};

		messageUtils.addListener(this.listener);
	};

	PortalWindowPublisher.prototype = new BaseWindowPublisher();

	return PortalWindowPublisher;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/respond/base-responder.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/respond/base-responder', [
], function() {

	/**
	 * Base responder object that provides common features inherited by the portal and client responders. Responder objects provide 
	 * request/response messaging functions.
	 * 
	 * @exports BaseResponder
	 * @constructor
	 */
	var BaseResponder = function() {

		/** @property {Object} responders Holds names of request types and which responder window can answer them. */
		this.responders = {};
		/** @property {Object} requesters Holds request instance identifiers and which window issued them.*/
		this.requesters = {};
		/** @property {Object} responseHandlers Holds handler functions that should be invoked for a specific request type to obtain a response. */
		this.responseHandlers = {};
		/** @property {Object} requestHandlers Holds requester handler functions that accept and process the response to a specific request instance. */
		this.requestHandlers = {};

		/**
		 * Function by which a responder window registers its ability to respond to a specific type of request.
		 * 
		 * @param request Name of the request type. Similar to the name of a topic in publish/subscribe.
		 * @param responderId Identifier of the window that can service the request.
		 * @param windowRef {Object} Reference for the window.
		 * @param windowUrl {string} URL of the window.
		 */
		this.addResponder = function(request, responderId, windowRef, windowUrl) {
			this.responders[request] = {
				responderId : responderId, 
				windowRef : windowRef, 
				windowUrl : windowUrl
			};
		};

		/**
		 * Registers a window against a given requestId. This is used to identify the window to which a response should be directed.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 * @param responderId Identifier of the window that issued the request.
		 * @param windowRef {Object} Reference for the window.
		 * @param windowUrl {string} URL of the window.
		 */
		this.addRequester = function(requestId, responderId, windowRef, windowUrl) {
			this.requesters[requestId] = {
				responderId : responderId, 
				windowRef : windowRef, 
				windowUrl : windowUrl
			};
		};

		/**
		 * Adds a request handler.
		 * 
		 * @param requestHandler Function that accepts and processes a response.
		 * @param requestId Unique identifier of a request instance.
		 */
		this.addRequestHandlers = function(requestHandlers, requestId) {
			this.requestHandlers[requestId] = requestHandlers;
		};

		/**
		 * Gets a registered window that can respond to a given type of request.
		 * 
		 * @param request Name of the request type.
		 */
		this.getResponder = function(request) {
			return this.responders[request];
		};

		/**
		 * Gets a registered window that issued a request identified by the id of that request.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 */
		this.getRequester = function(requestId) {
			return this.requesters[requestId];
		};

		/**
		 * Gets a registered response handler function for a given request name.
		 * 
		 * @param request Name of the type of request.
		 */
		this.getResponseHandler = function(request) {
			return this.responseHandlers[request];
		};

		/**
		 * Gets a registered request handler function for a given request identifier.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 */
		this.getRequestHandler = function(requestId) {
			return this.requestHandlers[requestId];
		};

		/**
		 * Removes the request instance from the register of requests when a request is complete.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 */
		this.setRequestComplete = function(requestId) {
			delete this.requesters[requestId];
		};

		/**
		 * Indicates if a given request type name has a window that can respond to it.
		 * 
		 * @param Name of the type of request.
		 * @return {boolean} Whether the request has a responder that can provide an answer.
		 */
		this.hasAnswer = function(request) {
			if(typeof this.responseHandlers[request] !== 'undefined') {
				return true;
			}

			return false;
		};

		/**
		 * Indicates if the given request instance has been provided with a response or is still awaiting an answer.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 * @return {boolean} Whether the request instance has been completed or not.
		 */
		this.isRequestComplete = function(requestId) {
			if(typeof this.getRequester(requestId) === 'undefined') {
				return true;
			}
			return false;
		};

		/**
		 * Indicates if the window issued the specific request instance provided.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 * @return {boolean} If the window issued the request or not.
		 */
		this.isRequester = function(requestId) {
			var requestHandler = this.getRequestHandler(requestId);
			if (typeof requestHandler !== 'undefined' && requestHandler !== null) {
				return true;
			}
			return false;
		};
	};

	return BaseResponder;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/respond/client-responder.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/respond/client-responder', [
	'ossui.messaging/respond/base-responder',
	'ossui.messaging/common/constants',
	'ossui.messaging/common/error-messages',
	'ossui.messaging/common/message-utils',
	'ossui.messaging/common/utils'
], function(BaseResponder, constants, errorMessages, messageUtils, utils) {

	/**
	 * Provides the {@link ClientMessageService} with request/response messaging functionality. A ClientResponder can offer responses and 
	 * submit requests.
	 *
	 * In messaging terms, client windows can be arranged hierarchically with a portal window at the top of the hierarchy. Within this 
	 * hierachy messages can be propagated:
	 * <ul>
	 * <li>upwards to another ClientResponder instance.</li>
	 * <li>upwards to the {@link PortalResponder} when the ClientResponder is a direct client of the Portal.</li>
	 * <li>downwards to any registered ClientResponder instances.</li>
	 * </ul>
	 *
	 * All requests and responses handled by the ClientResponder are ultimately directed at the {@link PortalResponder} which performs the 
	 * task of finding the correct response for each request.
	 *
	 * @exports ClientResponder
	 * @constructor
	 *   @param targetUrl URL of the window with which the ClientResponder communicates upwards.
	 *   @param targetWindow Object reference for the window with which the ClientResponder communicates upwards.
	 * @augments BaseWindowPublisher
	 */
	var ClientResponder = function(targetUrl, targetWindow) {

		BaseResponder.apply(this, arguments);

		var self = this;
		var responderId = utils.getUniqueId();

		/**
		 * Message event listener that handles messages from other windows/iframes.
		 * Determines the direction the message is travelling, either towards the Portal or towards other child client windows, and calls 
		 * the appropriate function to handle the message.
		 * 
		 * @param {Object} event The event object for the message listener. Contains the message content and information describing the origin of 
		 * the message.
		 */
		this.listener = function(event) {
			var payload = '';
			try {
				payload = messageUtils.parseMessage(event.data);
			} catch(err) {
				throw err;
			}

			var windowRef = event.source,
				windowUrl = event.origin;

			if (payload.target === constants.MESSAGE_DIRECTION_PORTAL) {
				self.portalBoundMessageHandler(payload, windowRef, windowUrl);
			}
			else if (payload.target === constants.MESSAGE_DIRECTION_CHILDREN) {
				self.childrenBoundMessageHandler(payload);
			}
		};

		/**
		 * Handles messages that need to be propagated towards the portal.
		 * 
		 * Accepts the following message types:
		 * <ol>
		 *   <li>add-response - registers the responder against a request type and propagates the message towards the portal</li>
		 *   <li>request - registers the requester and propagates the request message towards the portal</li>
		 *   <li>response - propagates a response message towards the portal</li>
		 * </ol>
		 * 
		 * @param {Object} payload Message content.
		 * @param {Object} windowRef Reference to the window generating the message.
		 * @param {string} windowUrl URL of the window generating the message.
		 */
		this.portalBoundMessageHandler = function(payload, windowRef, windowUrl) {

			if (payload.messageType === constants.MESSAGE_TYPE_ADD_RESPONSE) {
				self.addResponder(payload.request, payload.responderId, windowRef, windowUrl);

				payload.responderId = self.getResponderId();

				messageUtils.post(targetWindow, payload, targetUrl);
			} else if (payload.messageType === constants.MESSAGE_TYPE_REQUEST) {
				self.addRequester(payload.requestId, payload.responderId, windowRef, windowUrl);

				payload.responderId = self.getResponderId();

				messageUtils.post(targetWindow, payload, targetUrl);
			} else if (payload.messageType === constants.MESSAGE_TYPE_RESPONSE) {
				payload.responderId = self.getResponderId();

				messageUtils.post(targetWindow, payload, targetUrl);
			}
		};

		/**
		 * Handles messages directed towards child client responders.
		 * Accepts request and response messages and invokes the appropriate function to process each type of message.
		 * 
		 * @param payload Message content.
		 */
		this.childrenBoundMessageHandler = function(payload) {

			if (payload.messageType === constants.MESSAGE_TYPE_RESPONSE) {
				self.processResponseMessage(payload);
			} else if (payload.messageType === constants.MESSAGE_TYPE_REQUEST) {
				self.processRequestMessage(payload);
			}
		};

		/**
		 * Determines if a request message can be handled by this particular ClientResponder instance or if it needs to be propagated to 
		 * another ClientResponder.
		 * 
		 * @param payload Message content.
		 */
		this.processRequestMessage = function(payload) {

			if(self.hasAnswer(payload.request)) {
				utils.async(function() {
					self.handleRequest(payload.request, payload.requestId, payload.data);
				}, 0);

			} else {
				var responder = self.getResponder(payload.request);

				if (typeof responder !== 'undefined' && payload.responderId !== responder.responderId) {
					var childBoundPayload = {
						target : payload.target,
						messageType : payload.messageType,
						request : payload.request,
						requestId : payload.requestId,
						data : payload.data,
						responderId : responder.responderId
					};

					messageUtils.post(responder.windowRef, childBoundPayload, responder.windowUrl);
				}
			}
		};

		/**
		 * Determines if the ClientResponder instance issued the request for the given response message so that it can process the response.
		 * Or if the message needs to be propagated to a requester registered against the request id for which the provided response has 
		 * been posted.
		 * 
		 * @payload Message content.
		 */
		this.processResponseMessage = function(payload) {

			if (self.isRequester(payload.requestId)) {
				utils.async(function() {
					self.handleResponse(payload);
				}, 0);
			} else {
				var requester = self.getRequester(payload.requestId);

				if (typeof requester !== 'undefined') {
					var childBoundPayload = {
						target : payload.target,
						messageType : payload.messageType,
						request : payload.request,
						requestId : payload.requestId,
						data : payload.data,
						responderId : requester.responderId,
						responseStatus : payload.responseStatus,
						errorMessage : payload.errorMessage
					};

					messageUtils.post(requester.windowRef, childBoundPayload, requester.windowUrl);
				}
			}
		};

		/**
		 * Handles the request by running the response handler. The response handler is passed a messaging callback function that must be 
		 * executed by the response handler to provide the ClientResponder with the response.
		 * 
		 * If the response handler throws an exception it posts an error with the error message.
		 * 
		 * @param request Name of the type of request.
		 * @param requestId Unique identifier of a request instance.
		 * @param data Optional value that may be used by the response handler to generate the response.
		 */
		this.handleRequest = function(request, requestId, data) {

			var messagingCallback = function(response) {
				var payload = {
					responseStatus : constants.RESPONSE_STATUS_SUCCESS,
					requestId : requestId,
					data : response
				};

				self.postResponse(payload);
			};

			var responseHandler = self.getResponseHandler(request);

			try {
				responseHandler(messagingCallback, data);
			} catch (err) {
				self.postError(requestId, errorMessages.ERROR_RESPONSE_FAILURE + ', ' + err.message);
			}
		};

		/**
		 * Handles a response for a request issued by the client responder. Depending on the status of the response (success or failure) 
		 * will invoke the appropriate success or error handler.
		 * 
		 * @param payload Response content.
		 */
		this.handleResponse = function(payload) {
			try {
				var requestHandler = self.getRequestHandler(payload.requestId);
				if (payload.responseStatus === constants.RESPONSE_STATUS_SUCCESS) {
					requestHandler.success(payload.data);
				} else if (payload.responseStatus === constants.RESPONSE_STATUS_ERROR) {
					requestHandler.error(payload.errorMessage);
				}
			} catch (err) {
				//console.log(errorMessages.ERROR_HANDLE_RESPONSE + ', ' + err.message);
				throw new Error(errorMessages.ERROR_HANDLE_RESPONSE + ', ' + err.message);
			}
		};

		/**
		 * Constructs a response payload and posts the response towards the portal using the postMessage web API.
		 * 
		 * @param payload Response information including the status of the response and the actual response content.
		 */
		this.postResponse = function(payload) {

			var postPayload = {
				target : constants.MESSAGE_DIRECTION_PORTAL,
				messageType : constants.MESSAGE_TYPE_RESPONSE,
				responseStatus : payload.responseStatus,
				requestId : payload.requestId,
				responderId : this.getResponderId(),
				data : payload.data,
				errorMessage : payload.errorMessage
			};

			try {
				messageUtils.post(targetWindow, postPayload, targetUrl);
			} catch(err) {
				//console.log(errorMessages.ERROR_PORTAL_POST_RESPONSE + ', ' + err.message);
				throw new Error(errorMessages.ERROR_PORTAL_POST_RESPONSE + ', ' + err.message);
			}
		};

		/**
		 * Used to post an error message if the response handler generated an exception.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 * @param errorMessage Message describing the exception generated by the response handler.
		 */
		this.postError = function(requestId, errorMessage) {
			var payload = {
				requestId : requestId,
				responseStatus : constants.RESPONSE_STATUS_ERROR,
				errorMessage : errorMessage
			};

			this.postResponse(payload);
		};

		/**
		 * Allows a component to register a response handler for a request type.
		 * 
		 * @param responseHandler Function that will be executed by the message service when a request is raised. The response handler
		 * function should accept two parameters:
		 * <ol>
		 *   <li>messagingCallback - This is the messaging callback that must be invoked by the response handler to communicate back the 
		 *   response to the request. The messaging callback accepts a single parameter for the contents of the response.</li>
		 *   <li>value - Optional payload provided as part of the request that may be used by the response handler to provide a response.</li>
		 * </ol>
		 * The responseHandler should throw an Exception with a suitable message if there are any errors in the generation of a response.
		 * @param request Identifies the request for which the response handler will provide a response.
		 */
		this.addResponseHandler = function(responseHandler, request) {
			this.responseHandlers[request] = responseHandler;

			var payload = {
				target : constants.MESSAGE_DIRECTION_PORTAL,
				messageType : constants.MESSAGE_TYPE_ADD_RESPONSE,
				request : request,
				responderId : this.getResponderId()
			};

			messageUtils.post(targetWindow, payload, targetUrl);
		};

		/**
		 * Issues a request message.
		 * 
		 * @param [requestHandlers.success] Function that handles a successful request. Accepts a parameter for the response.
		 * @param [requestHandlers.error] Function that handles a request failure. Accepts a parameter for the response error.
		 * @param request Name of the type of request.
		 * @param data Optional data provided as part of the request.
		 */
		this.request = function(requestHandlers, request, data) {
			var requestId = utils.getUniqueId();
			this.addRequestHandlers(requestHandlers, requestId);

			var payload = {
				target : constants.MESSAGE_DIRECTION_PORTAL,
				messageType : constants.MESSAGE_TYPE_REQUEST,
				request : request,
				requestId : requestId,
				data : data,
				responderId : this.getResponderId()
			};

			messageUtils.post(targetWindow, payload, targetUrl);
		};

		/**
		 * Gets the unique identifier for the ClientResponder instance.
		 * 
		 * @returns ClientResponder instance identifier.
		 */
		this.getResponderId = function() {
			return responderId;
		};

		messageUtils.addListener(this.listener);
	};

	ClientResponder.prototype = new BaseResponder();

	return ClientResponder;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/respond/portal-responder.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging/respond/portal-responder', [
	'ossui.messaging/respond/base-responder',
	'ossui.messaging/common/constants',
	'ossui.messaging/common/error-messages',
	'ossui.messaging/common/message-utils',
	'ossui.messaging/common/utils'
], function(BaseResponder, constants, errorMessages, messageUtils, utils) {


	/**
	 * Provides the {@link PortalMessageService} with functionality manage request and response messages between components distributed 
	 * across application windows.
	 * 
	 * In messaging terms, the portal sits at the top of a hierarchy of client windows/iframes and distributes messages to the appropriate 
	 * client.
	 * 
	 * @exports PortalResponder
	 * @constructor
	 *   @param responseTimeout  Default is no timeout. Value in milliseconds for the time to wait for a response.
	 * @augments BaseWindowPublisher
	 */
	var PortalResponder = function(responseTimeout) {

		BaseResponder.apply(this, arguments);

		var _responseTimeout = responseTimeout || constants.NO_RESPONSE_TIMEOUT;

		var self = this;

		/**
		 * Message event listener that receives messages from other windows/iframes. Parses the message and forwards to the messageHandler.
		 * 
		 * @param {Object} event The event object for the message listener. Contains the message content and information describing the 
		 * origin of the message.
		 */
		this.listener = function(event) {
			var payload = '';
			try {
				payload = messageUtils.parseMessage(event.data);
			} catch(err) {
				throw err;
			}

			var windowRef = event.source,
				windowUrl = event.origin;

			self.messageHandler(payload, windowRef, windowUrl);
		};

		/**
		 * Examines the type of message and invokes the appropriate action for each type of meessage. Accepts the following message types:
		 * <ol>
		 *   <li>add-response - registers the responder against a request type</li>
		 *   <li>request - invokes the request processing function {@link processRequest}</li>
		 *   <li>response- invokes the response processing function {@link processResponse}</li>
		 * </ol>
		 * 
		 * @param {Object} payload Message content.
		 * @param {Object} windowRef Reference to the window generating the message.
		 * @param {string} windowUrl URL of the window generating the message.
		 */
		this.messageHandler = function(payload, windowRef, windowUrl) {

			if (payload.messageType === constants.MESSAGE_TYPE_ADD_RESPONSE) {

				self.addResponder(payload.request, payload.responderId, windowRef, windowUrl);

			} else if (payload.messageType === constants.MESSAGE_TYPE_REQUEST) {

				this.processRequest(payload, windowRef, windowUrl);

			} else if (payload.messageType === constants.MESSAGE_TYPE_RESPONSE) {

				this.processResponse(payload, windowRef, windowUrl);

			}
		};

		/**
		 * Registers the requester and if the Portal has a response for the request it invokes the request handler, otherwise it posts 
		 * the request towards a ClientResponder that does have an answer for the request.
		 * 
		 * @param {Object} payload Request message content.
		 * @param {Object} windowRef Reference to the window generating the message.
		 * @param {string} windowUrl URL of the window generating the message.
		 */
		this.processRequest = function(payload, windowRef, windowUrl) {
			self.addRequester(payload.requestId, payload.responderId, windowRef, windowUrl);

			self.startTimeoutHandler(payload.requestId);

			if(this.hasAnswer(payload.request)) {
				utils.async(function() {
					self.handleRequest(payload.request, payload.requestId, payload.data);
				}, 0);
			} else {
				self.postRequest(payload.request, payload.requestId, payload.data);
			}
		};

		/**
		 * If the request was generated by a Portal component it handles the response, otherwise it posts the response towards a
		 * ClientResponsder that issued the request.
		 * 
		 * @param {Object} payload Response message content.
		 * @param {Object} windowRef Reference to the window generating the message.
		 * @param {string} windowUrl URL of the window generating the message.
		 */
		this.processResponse = function(payload, windowRef, windowUrl) {
			if (self.isRequester(payload.requestId)) {
				this.handleResponse(payload);
			} else {
				self.postResponse(payload);
			}
		};

		/**
		 * Constructs a request payload and posts it to a ClientResponder that has registered itself as a responder for the type of request.
		 * 
		 * @param request Name of the type of request.
		 * @param requestId Unique identifier of a request instance.
		 * @param data Optional value that may be used by the response handler to generate the response.
		 */
		this.postRequest = function(request, requestId, data) {
			var responder = self.getResponder(request);

			if(typeof responder === 'undefined' || responder === null) {
				this.postError(requestId, errorMessages.ERROR_NO_RESPONDER_FOUND + ': ' + request);
			} else {
				var payload = {
					target : constants.MESSAGE_DIRECTION_CHILDREN,
					messageType : constants.MESSAGE_TYPE_REQUEST,
					request : request,
					requestId : requestId,
					data : data,
					responderId : responder.responderId
				};

				try {
					messageUtils.post(responder.windowRef, payload, responder.windowUrl);
				} catch(err) {
					//console.log(errorMessages.ERROR_PORTAL_POST_REQUEST + ': ' + request + ', ' + err.message);
					throw new Error(errorMessages.ERROR_PORTAL_POST_REQUEST + ': ' + request + ', ' + err.message);
				}
			}
		};

		/**
		 * Constructs a response payload and posts the response to the ClientResponder that issued the request.
		 * Sets the request as complete.
		 * 
		 * @param payload Response message content.
		 */
		this.postResponse = function(payload) {
			// Prevent posting a response for a request that has timed out
			if (!this.isRequestComplete(payload.requestId)) {
				var requester = this.getRequester(payload.requestId);

				var postPayload = {
					target : constants.MESSAGE_DIRECTION_CHILDREN,
					messageType : constants.MESSAGE_TYPE_RESPONSE,
					responseStatus : payload.responseStatus,
					requestId : payload.requestId,
					responderId : requester.responderId,
					data : payload.data,
					errorMessage : payload.errorMessage
				};

				this.setRequestComplete(payload.requestId);

				try {
					messageUtils.post(requester.windowRef, postPayload, requester.windowUrl);
				} catch(err) {
					//console.log(errorMessages.ERROR_PORTAL_POST_RESPONSE + ', ' + err.message);
					throw new Error(errorMessages.ERROR_PORTAL_POST_RESPONSE + ', ' + err.message);
				}
			}
		};

		/**
		 * Used to post an error message if the handling of a request failed.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 * @param errorMessage Message describing the error in handling the request.
		 */
		this.postError = function(requestId, errorMessage) {
			var payload = {
				requestId : requestId,
				responseStatus : constants.RESPONSE_STATUS_ERROR,
				errorMessage : errorMessage
			};

			this.postResponse(payload);
		};

		/**
		 * Handles the request by running the response handler. The response handler is passed a messaging callback function that must be 
		 * executed by the response handler to provide the ClientResponder with the response.
		 * 
		 * If the response handler throws an exception it posts an error with the error message.
		 * 
		 * @param request Name of the type of request.
		 * @param requestId Unique identifier of a request instance.
		 * @param data Optional value that may be used by the response handler to generate the response.
		 */
		this.handleRequest = function(request, requestId, data) {

			var messagingCallback = function(response) {
				var payload = {
					responseStatus : constants.RESPONSE_STATUS_SUCCESS,
					requestId : requestId,
					data : response
				};

				if(!self.isRequestComplete(requestId)) {
					self.postResponse(payload);
				}
			};

			var responseHandler = self.getResponseHandler(request);

			try {
				responseHandler(messagingCallback, data);
			} catch (err) {
				self.postError(requestId, errorMessages.ERROR_RESPONSE_FAILURE + ', ' + err.message);
			}
		};

		/**
		 * Handles a response for a request issued by the Portal. Depending on the status of the response (success or failure) 
		 * will invoke the appropriate success or error handler.
		 * 
		 * @param payload Response content.
		 */
		this.handleResponse = function(payload) {
			try {
				var requestHandler = self.getRequestHandler(payload.requestId);
				if (payload.responseStatus === constants.RESPONSE_STATUS_SUCCESS) {
					requestHandler.success(payload.data);
				} else if (payload.responseStatus === constants.RESPONSE_STATUS_ERROR) {
					requestHandler.error(payload.data);
				}
			} catch (err) {
				//console.log(errorMessages.ERROR_HANDLE_RESPONSE + ',request: ', + payload.request + ', ' + err.message);
				throw new Error(errorMessages.ERROR_HANDLE_RESPONSE + ',request: ', + payload.request + ', ' + err.message);
			}
		};

		/**
		 * Allows a component to register a response handler for a request type.
		 * 
		 * @param responseHandler Function that will be executed by the message service when a request is raised. The response handler
		 * function should accept two parameters:
		 * <ol>
		 *   <li>messagingCallback - This is the messaging callback that must be invoked by the response handler to communicate back the 
		 *   response to the request. The messaging callback accepts a single parameter for the contents of the response.</li>
		 *   <li>value - Optional payload provided as part of the request that may be used by the response handler to provide a response.</li>
		 * </ol>
		 * The responseHandler should throw an Exception with a suitable message if there are any errors in the generation of a response.
		 * @param request Identifies the request for which the response handler will provide a response.
		 */
		this.addResponseHandler = function(responseHandler, request) {
			this.responseHandlers[request] = responseHandler;
		};

		/**
		 * Peforms request processing tasks, including:
		 * <ol>
		 *   <li>Registers the request.</li>
		 *   <li>If the Portal has an answer for the request it initiates the generation of a response.</li>
		 *   <li>If the Portal does not have a response it issues the request to a ClientResponder</li>
		 * </ol>
		 * 
		 * Uses a globally set timeout parameter to cancel the request and send a timeout failure response if the timeout
		 * has been exceded during the generation of the response.
		 * 
		 * @param [requestHandlers.success] Function that handles a successful request. Accepts a parameter for the response.
		 * @param [requestHandlers.error] Function that handles a request failure. Accepts a parameter for the response error.
		 * @param request Name of the type of request.
		 * @param data Optional data provided as part of the request.
		 */
		this.request = function(requestHandlers, request, data) {
			var requestId = utils.getUniqueId();
			self.addRequestHandlers(requestHandlers, requestId);

			self.startTimeoutHandler(requestId);

			if(this.hasAnswer(request)) {
				utils.async(function() {
					self.callResponseHandler(request, requestId, data);
				}, 0);
			} else {
				self.postRequest(request, requestId, data);
			}
		};

		/**
		 * Generates a response for a request for which the Portal has a response.
		 * 
		 * @param request Name of the type of request.
		 * @param requestId Unique identifier of a request instance.
		 * @param data Optional value that may be used by the response handler to generate the response.
		 */
		this.callResponseHandler = function(request, requestId, data) {
			var responseHandler = self.getResponseHandler(request);
			var requestHandler = self.getRequestHandler(requestId);

			var messagingCallback = function(response) {
				requestHandler.success(response);
				self.setRequestComplete(requestId);
			};

			try {
				responseHandler(messagingCallback, data);
			} catch (err) {
				//console.log(errorMessages.ERROR_RESPONSE_FAILURE + ', ' + request + ', ' + err.message);
				requestHandler.error(errorMessages.ERROR_RESPONSE_FAILURE + ', ' + request + ', ' + err.message);
				self.setRequestComplete(requestId);
			}
		};

		/**
		 * Posts a response timeout failure message to the requester.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 */
		this.handleResponseTimeout = function(requestId) {
			self.postError(requestId, errorMessages.ERROR_RESPONSE_TIMEOUT);
		};

		/**
		 * If a response timeout has been set it calls the response timeout handler if the response timeout has been execed.
		 * 
		 * @param requestId Unique identifier of a request instance.
		 */
		this.startTimeoutHandler = function(requestId) {
			var responseTimeout = self.getResponseTimeout();

			if(responseTimeout !== constants.NO_RESPONSE_TIMEOUT) {
				setTimeout(function() {
					if(!self.isRequestComplete(requestId)) {
						self.handleResponseTimeout(requestId);
					}
				}, responseTimeout);
			}
		};

		/**
		 * Gets the response timeout value.
		 * 
		 * @returns Response timeout value.
		 */
		this.getResponseTimeout = function() {
			return _responseTimeout;
		};

		messageUtils.addListener(this.listener);
	};

	PortalResponder.prototype = new BaseResponder();

	return PortalResponder;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-messaging-zip/src/main/webapp/messaging/messaging.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.messaging.components', [
	'ossui.messaging/message-service/message-service-factory',
	'ossui.messaging/common/constants',
	'ossui.messaging/common/error-messages',
	'ossui.messaging/common/message-utils',
	'ossui.messaging/common/utils',
	'ossui.messaging/message-service/base-message-service',
	'ossui.messaging/message-service/client-message-service',
	'ossui.messaging/message-service/portal-message-service',
	'ossui.messaging/publish/publisher/publisher',
	'ossui.messaging/publish/window-publisher/base-window-publisher',
	'ossui.messaging/publish/window-publisher/client-window-publisher',
	'ossui.messaging/publish/window-publisher/portal-window-publisher',
	'ossui.messaging/respond/base-responder',
	'ossui.messaging/respond/client-responder',
	'ossui.messaging/respond/portal-responder'
], function(messageServiceFactory, constants, errorMessages, messageUtils, utils,
			BaseMessageSerivce, ClientMessageService, PortalMessageService,
			Publisher, BaseWindowPublisher, ClientWindowPublisher, PortalWindowPublisher,
			BaseResponder, ClientResponder, PortalResponder) {
	return {
		messageServiceFactory : messageServiceFactory,
		constants : constants,
		errorMessages : errorMessages,
		messageUtils : messageUtils,
		utils : utils,
		BaseMessageSerivce : BaseMessageSerivce,
		ClientMessageService : ClientMessageService,
		PortalMessageService : PortalMessageService,
		Publisher : Publisher,
		BaseWindowPublisher : BaseWindowPublisher, 
		ClientWindowPublisher : ClientWindowPublisher,
		PortalWindowPublisher : PortalWindowPublisher,
		BaseResponder : BaseResponder,
		ClientResponder : ClientResponder,
		PortalResponder : PortalResponder
	};
});

define('ossui.messaging', ['ossui.messaging.components'], function (ossuiMessagingComponents) { return ossuiMessagingComponents; } );
