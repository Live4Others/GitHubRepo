/*
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui/utils/OSSUIUtils',[
                                 'jquery',
                                 'underscore',
                                 'lightsaber',
                                 'ossui/widget/ModalDialogView',
                                 'ossui/widget/FormInputViewModel',
                                 'ossui/widget/FormInputDialog',	
                                 'ossui/utils/OSSUIResourceBundle',
                                 'ossui/widget/ModalDialogCallback',
                                 'ossui.messaging'
                                 ], 
                                 /*global console */
                                 function($, _, Lightsaber, ModalDialogView, FormInputViewModel, FormInputDialog, OSSUIResourceBundle, ModalDialogCallback, Messaging) {

	function OSSUIUtils() {

		this.ERROR_ID_ZERO = "0";
		// special handling  for certain HTTP codes
		this.ERROR_ID_BAD_REQUEST = "400";
		this.ERROR_ID_UNAUTHORIZED = "401";
		this.ERROR_ID_FORBIDDEN = "403";
		this.ERROR_ID_NOT_FOUND = "404";
		this.ERROR_ID_TIMEOUT = "408";
		this.ERROR_ID_INTERNAL_SERVER = "500";
		this.ERROR_ID_SERVICE_UNAVAILABLE = "503";


		this.errorEventNumber  = 0; 
		/* jshint maxcomplexity: 12 */    
		this.isBlank = function(obj) {

			// cater for numeric  cases (eg: 0)
			if (!_.isUndefined(obj) &&   obj !== null  && (typeof obj === 'number' &&  !isNaN(obj) )) {
				return false;
			}
			// cater for Date  cases 
			if (!_.isUndefined(obj) &&   obj !== null  && (obj instanceof Date && !isNaN(Number(obj)))) {
				return false;
			}

			// if (!obj || !/\S/.test(obj)) return true;
			if (!obj || $.trim(obj) === "") {
				return true;
			}

			if (obj.length && obj.length > 0) {
				return false;
			}
			for ( var prop in obj) {
				if (obj[prop]) {
					return false;
				}
			}
			return true;
		};

		/**
		 * Action to be taken at logout phase.
		 * It needs to do the following:
		 * - call the Logout REST service
		 * - execute security token cleanup
		 * - expire the UXF security cookie
		 * - execute a reload, ensuring the cache is cleared
		 */
		this.logout = function(callingModule, custLogoutService, custLogoutPage, custErrorPage, redirectToModuleId) {

			var LogoutRestNotifier = Lightsaber.Core.RESTModel.extend({
				url : OSSUIResourceBundle.prototype.getLabel('ossui.rest.logout.url') || "services/PortalLogout"
			});

			var logoutModel = new LogoutRestNotifier({
				rest : {
					read : {
						method : "GET"
					}
				}
			});

			var appConfig = callingModule.appConfig;

			logoutModel.fetch({
				async: false,
				success : function(resp) {
					if (appConfig){
						for(var i = 0 ; i<appConfig.length; i++) { 
							var options1 = {
								responseTimeout: 5000
							};
							var portalMessageService = Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_PORTAL, options1);
							portalMessageService.publish('true', 'sessionLogout-' + appConfig[i].appId);		
						}
					}
					
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.username.key') || "defaultuserloginname");

					var cookieName = OSSUIResourceBundle.prototype.getLabel("ossui.cookie.security.token.name") || 'LS_SECURITY_TOKEN';
					document.cookie = cookieName + '=; expires=Thu, 1 Jan 1970 00:00:00 UTC; path=/';

					//HF Rollup OSSUI_9.1.0.11-9450.  This needs to be re-factored into 
					//smaller methods when we have some test cases to support it.
					if (custLogoutService){
						//customized logout service
						
						$.ajax({
							url: custLogoutService,
							success: function(result,status,xhr){
								console.log("ajax success");
								if (custLogoutPage){
									location.replace(custLogoutPage);
								}
								else{
									location.reload(true);	
								}
							},
							error : function(xhr,status,error){
								console.log("ajax error");
								if (custErrorPage){
									location.replace(custErrorPage);
								}
								else{
									location.reload(true);	
								}
							},
							async: false						
						});
					}
					else{
						//default logout success flow, goes to login page.
						location.reload(true);						
					}
				},
				error : function(originalModel, resp, options) {
					console.log("error: " + resp.status + ": " + resp.statusText);

					if (appConfig){
						for(var i = 0 ; i<appConfig.length; i++) { 
							var options2 = {
								responseTimeout: 5000
							};
							var portalMessageService = Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_PORTAL, options2);
							portalMessageService.publish('true', 'sessionLogout-' + appConfig[i].appId);		
						}
					}
					
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.username.key') || "defaultuserloginname");

					var cookieName = OSSUIResourceBundle.prototype.getLabel("ossui.cookie.security.token.name") || 'LS_SECURITY_TOKEN';
					document.cookie = cookieName + '=; expires=Thu, 1 Jan 1970 00:00:00 UTC; path=/';
					location.reload(true);
				}
			});
		};

		/**
		 * Action to be taken when the browser window is closed. Either via a tab closure or a closure of the browser.
		 * It needs to do the following:
		 * - call the Logout REST service
		 * - execute security token cleanup
		 * - expire the UXF security cookie
		 */
		this.terminateSession = function(restUrl){
			var TerminateSessionRestNotifier = Lightsaber.Core.RESTModel.extend({
				url : restUrl || OSSUIResourceBundle.prototype.getLabel('ossui.rest.logout.url') || "services/PortalLogout"
			});

			var terminateSessionModel = new TerminateSessionRestNotifier({
				rest : {
					read : {
						method : "GET"
					}
				}
			});

			terminateSessionModel.fetch({
				async: false,
				success : function(resp) {
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.security.token.key') || "defaultLightsaberSessionToken");
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.username.key') || "defaultuserloginname");

					var cookieName = OSSUIResourceBundle.prototype.getLabel("ossui.cookie.security.token.name") || 'LS_SECURITY_TOKEN';
					document.cookie = cookieName + '=; expires=Thu, 1 Jan 1970 00:00:00 UTC; path=/';
				},
				error : function(originalModel, resp, options) {
					console.log("error: " + resp.status + ": " + resp.statusText);

					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.security.token.key') || "defaultLightsaberSessionToken");
					Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.username.key') || "defaultuserloginname");

					var cookieName = OSSUIResourceBundle.prototype.getLabel("ossui.cookie.security.token.name") || 'LS_SECURITY_TOKEN';
					document.cookie = cookieName + '=; expires=Thu, 1 Jan 1970 00:00:00 UTC; path=/';
				}
			});
		};

		// add the error code suffix at the end of the message
		this.getCodeSuffix = function(code, ifBrackets)
		{   var begin = ifBrackets?" (":" ";
		var end = ifBrackets?")":"";

		var suffix = '';
		if (!_.isUndefined(code) && ("" + code).length > 0) {
			suffix = begin + code + end;
		}
		return suffix;
		};

		/**
		 * extract the code-based message based on a double try:
		 * - firstly try to fetch the message placed underneath its code value(".errorcode.[codeValue]")
		 * - else try to fetch the message placed underneath its parent area (".errorcode")
		 * */

		this.extractCodeMessage = function (baseKeyForMessages,
				codeType, codeValue, ifBrackets)
				{
			// firstly check the branch denoted by the code value
			var localisedCodeMsg = '';
			localisedCodeMsg = OSSUIResourceBundle.prototype.getMessage(
					baseKeyForMessages
					+ '.' + codeType + '.' + codeValue);

			// else do rely on the branch situated one-level-up ( aka - no code value) 
			if (this.isBlank(localisedCodeMsg)) {
				localisedCodeMsg = 
					OSSUIResourceBundle.prototype.getMessage(
							baseKeyForMessages
							+ '.' + codeType);
			}

			if (!this.isBlank(localisedCodeMsg)) {
				return localisedCodeMsg + this.getCodeSuffix(codeValue,ifBrackets);

			} else {
				return localisedCodeMsg;
			}

				};

				/**
				 * Raises the actual popup dialog
				 */
				this.raisePopupDialog = function(message, windowTitle, windowButtonText,windowHeight,code){
					var self = this;
					if (_.isUndefined(windowTitle) || windowTitle === null){
						//english language backup if we get a message before we actually have any localisation data!
						windowTitle = "Service failure";
						windowButtonText = "OK";
					}
					if (_.isUndefined(windowHeight) || windowHeight === null){
						windowHeight = "220";
					}
					// if still blank at this stage - although unlikely.
					if (_.isUndefined(message) || message === null){
						message = windowTitle;
					}

					var okClicked = false;
					
					var modalWarningWindow = new ModalDialogView({
						viewModel :  new Lightsaber.Core.ViewModel(),
						title : windowTitle,
						height : windowHeight,
						buttons :   [  {
							text : windowButtonText ,
							click : function(event){
								okClicked = true;
								$(this).dialog("close");
								self.postErrorActions(code);
							}

						} ],
						config  : {
							dialogtemplate : '<div class="ossui-error-messageicon" style="float:left;"></div>' + 
							'<div style="overflow-y:auto;">' + 
							message+
							'</div>' 
						}
					});
					modalWarningWindow.render();
					modalWarningWindow.$el.on('dialogclose', function(){
						if (!okClicked){
							self.postErrorActions(code);
						}
					});
				};

				this.getInputModel = function(inputObjects) {
					var inputFields = [];
					for(var i=0; i<inputObjects.length; i++) {
						inputFields[i] = inputObjects[i];
					}

					var inputModel = new Lightsaber.Core.RESTModel();
					inputModel.set('inputfields', inputFields);

					return inputModel;
				};

				this.getInputViewModel = function(inputModel, inputDataBindings) {
					var inputViewModel = new FormInputViewModel({
						models : {
							data : inputModel
						},

						dataBindings : inputDataBindings				
					});

					return inputViewModel;
				};

				this.getDataBindings = function(inputModel) {
					var dataBindings = [];
					var inputFields = inputModel.get('inputfields');
					for(var i=0; i<inputFields.length; i++) {
						var bindingObj = {};
						var field = inputFields[i].name;	
						var modelAttr = 'models.data.'+field;

						bindingObj[field] = modelAttr;
						bindingObj.options = { 
								setOnBind : true,
								twoWay : true
						};					
						dataBindings.push(bindingObj);
					}

					return dataBindings;

				};

				this.raiseInputDialog = function(inputObjects, windowTitle, callback, windowHeight) {
					_.bindAll(this, 'inputDialogCallback');

					this.responseCallback = callback;
					if (_.isUndefined(windowTitle) || windowTitle === null){
						//english language backup if we get a message before we actually have any localisation data!
						windowTitle = "Form Input";			
					}
					if (_.isUndefined(windowHeight) || windowHeight === null){
						windowHeight = "220";
					}

					var inputModel = this.getInputModel(inputObjects);	
					var inputDataBindings = this.getDataBindings(inputModel);
					var inputViewModel = this.getInputViewModel(inputModel, inputDataBindings);

					this.modalInputWindow = new FormInputDialog({                              
						viewModel :  inputViewModel,

						config  : {                                  
							height : windowHeight,	
							title : windowTitle					
						}

					});
					this.modalInputWindow.render();

					inputViewModel.on('inputSuccess', this.inputDialogCallback);

				};

				this.inputDialogCallback = function() {
					this.responseCallback(this.modalInputWindow.viewModel.models.data.attributes);
				};


				/**
				 * extract error code
				 */
				this.extractStatusCode =  function(response)
				{   var code = "";
				// use the default exception status code
				if (!_.isUndefined(response) && !_.isUndefined(response.status))
				{
					code =  response.status ;
				}
				return code;
				};
				var self = this;

				this.sendTokenTimeoutMessage = function() {
					var parentWindow = window.parent,
					parentUrl = Messaging.messageUtils.getTargetUrl(document.referrer),
					options = {
						targetUrl : parentUrl,
						targetWindow : parentWindow
					};

					var clientMessageService =  Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_CLIENT, options);

					clientMessageService.publish('true', 'tokenTimeout');
				};



				/**
				 * execute post error actions
				 */
				this.postErrorActions = function(code) {
					// special case for timeouts - trigger a "timeoutEventHandler" (after showing the popup window).
					switch ('' + code) {
					case self.ERROR_ID_TIMEOUT:
						//cater for arcane issue with doubly generated events
						if (this.errorEventNumber  <= 0 ){
							ModalDialogCallback.trigger('timeoutEventHandler',this);
							this.errorEventNumber = this.errorEventNumber + 1;
						}
						this.unbind();
						break;
					case self.ERROR_ID_UNAUTHORIZED:
						//let the portal know the authentication token has timed out
						self.sendTokenTimeoutMessage();
						break;
					}
				};
				/**
				 * A basic error handler for that shows the back-end triggered errors - as an alert box.
				 * The basic MO had been tailored on the "Search" app way of showing the pop-ups .
				 */
				/* jshint maxcomplexity: 24 */
				this.launchErrorWindow = function(response, windowTitle,
						windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedMessages, baseKeyForCodeBasedMessages
				) {
					var message = '';
					var responseTextString ='';
					
					//defect 16930 - We need to have the error code/id displayed at all times, not just when these parameters are populated.  
					//Rather than change all code using this function adding the default values here.
					if (_.isUndefined(baseKeyForStatusBasedMessages)){
						baseKeyForStatusBasedMessages =  "ossui.errorMessages";
						baseKeyForCodeBasedMessages = "ann.search.ui.error.popup.servicefailure";
					}

					// we'd need the [code] whichever way we construct the message.
					var status = this.extractStatusCode(response); 

					// firstly try to use the message sent by the client - if extant
					if (!this.isBlank(localisedMessage)) {
						message = this.htmlEncode(localisedMessage);
					} else {
						// else use the middle tier message
						if (!_.isUndefined(response)) {

							// "responseText" object is specific to the "search" app 
							var responseTextObj = null;
							if ( !this.isBlank(response.responseText)) {
								try {
									responseTextObj = JSON
									.parse(response.responseText);
								} catch (error) {
									responseTextString = response.responseText;
								}
							}
							if (!$.isEmptyObject(responseTextObj)) {

								// first option is for the userMessage
								if ( !this.isBlank(responseTextObj.userMessage)) {
									message = this.htmlEncode(responseTextObj.userMessage);
								}
								// else - do use the status text  
								else 
								{
									message = this.htmlEncode(response.statusText);
								}
								//defect 1056 aqueels Commented the code below to remove the plsql Exception message from pop up window
								
								// add the "error code" msg regardlessly 
								/*if (!this.isBlank(responseTextObj.errorCode)) {
									var errCodeMessage = this.extractCodeMessage(baseKeyForCodeBasedMessages, 'errorcode', responseTextObj.errorCode,false);
									if (!this.isBlank(errCodeMessage)) {
										message += '<br>' + this.htmlEncode(errCodeMessage);
									}
									// add the "error id"  msg regardlessly
									if (!this.isBlank(responseTextObj.errorId)) {
										var errIdMessage = this.extractCodeMessage(baseKeyForCodeBasedMessages , 'errorid' , responseTextObj.errorId,false);
										if (!this.isBlank(errIdMessage)) {
											message += '<br>' + this.htmlEncode(errIdMessage);
										}
									}

								}*/
							}// end of "responseTextObj" rules

							/*
							 * if nothing inside the response.responseText ,
							 * we're going to concentrate on the response object
							 * itself
							 */
							else {
								//cater for the most relevant HTTP codes firstly.
								switch (''+status) {
								case  this.ERROR_ID_BAD_REQUEST:
								case  this.ERROR_ID_UNAUTHORIZED:
								case  this.ERROR_ID_FORBIDDEN:
								case  this.ERROR_ID_NOT_FOUND :
								case  this.ERROR_ID_TIMEOUT :
								case  this.ERROR_ID_INTERNAL_SERVER :
								case  this.ERROR_ID_SERVICE_UNAVAILABLE :
									message = this.htmlEncode(this.extractCodeMessage(baseKeyForStatusBasedMessages , 'errorCode',status,true));
									break;
								}
								// if message is still blank at this stage , then the priority goes to the "statusText" 
								if (this.isBlank(message) && !this.isBlank(response.statusText)) {
									message = this.htmlEncode(response.statusText +this.getCodeSuffix(status,true));

								} 
								// check for all *other* error statuss that might be in the DB (not necessarily HTTP codes)  
								if (this.isBlank(message) && !this.isBlank(''+status)) {
									message += this.htmlEncode(this.extractCodeMessage(baseKeyForStatusBasedMessages, 'errorCode', status,true));
								}
								// this [response.message] is for garden variety LS errors (throw new Error ..etc)
								if (this.isBlank(message)
										&& !this.isBlank(response.message)) {
									message = this.htmlEncode(response.message);
								}
								// last resort: [responseTextString] is the string that was not parseable as JSON object
								if (this.isBlank(message)
										&& !this.isBlank(responseTextString)) {
									message = this.htmlEncode(responseTextString);
								}
							}                    

						}// end if response not null
					}

					self.raisePopupDialog(message, windowTitle,
							windowButtonText, windowHeight,status);

				};

				/**
				 * HTML encodes a string.
				 * @param value The string to be HTML encoded.
				 * @returns {String} The HTML encoded string.
				 */
				this.htmlEncode = function(value) {
					return $('<div/>').text(value).html();
				};

				/**
				 * Decodes an HTML encoded string.
				 * @param value The string to be decoded.
				 * @returns {String} The decoded string.
				 */
				this.htmlDecode = function(value) {
					return $('<div/>').html(value).text();
				};

				/**
				 * Returns cookie value for a cookie name
				 */
				this.getCookie = function(key) {
					if (!key) { 
						return null; 
					}
					return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
				};	
	}

	return new OSSUIUtils();
});
//console.log('* OSSUIUtils.js loaded');
