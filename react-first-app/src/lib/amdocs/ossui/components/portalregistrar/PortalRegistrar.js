/*
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui/portalregistrar/PortalRegistrar',[
                                                'jquery',
                                                'underscore',
                                                'lightsaber',
                                                'ossui.messaging',
                                                'ossui/utils/OSSUIUtils'
                                                ], 
                                                /*global console */
                                                function($, _, Lightsaber, Messaging, OSSUIUtils) {

	function PortalRegistrar() {
       this.portalRegistrationDone = false;
		/**
		 * Default implementation, should be overridden by the parent application.
		 */
		this.openSettings = function(){
			//TODO - config for message and button text
			OSSUIUtils.raisePopupDialog($('<div/>').text("No settings for application").html(), "",
					"Ok", null,null);
		};

		/**
		 * Default implementation, should be overridden by the parent application.
		 */
		this.openHelp = function(){
			//TODO - config for message and button text
			OSSUIUtils.raisePopupDialog($('<div/>').text("No help for application").html(), "",
					"Ok", null,null);
		};

		/**
		 * Default implementation, should be overridden by the parent application.
		 */
		this.receiveDisplayNotification = function(data){
			window.console.log("receiveDisplayNotification: "+JSON.stringify(data));
		};
		
		/**
		 * Default implementation, should be overridden by the parent application.
		 */
		this.sessionLogout = function(){
			//config for session logout cleanup.
			Lightsaber.Core.StorageUtil.getStorage().deleteKey(OSSUIResourceBundle.prototype.getLabel('ossui.session.storage.security.token.key') || "defaultLightsaberSessionToken");
		};

		/**
		 * Default implementation, this has been created so that every time the portal is clicked (e.g. switching to a new application)
		 * this application is left in a specific state.  In this default case we want to tell select2 to close any open search box
		 * as select2 does not like 2 open at once, so if the user opens another in the second app it will cause problems.
		 */
		this.portalClickedNotification = function(data){
			if (require.defined('select2')){
				$('#select2-drop').select2('close');
			}
		};

		this.setupMessaging = function(documentReferrer){
			var parentWindow = window.parent,
			parentUrl = Messaging.messageUtils.getTargetUrl(documentReferrer),
			options = {
				targetUrl : parentUrl,
				targetWindow : parentWindow
			};

			this.clientMessageService =  Messaging.messageServiceFactory.createMessageService(Messaging.constants.MODE_CLIENT, options);
		};

		this.initialise = function(documentReferrer){
			this.setupMessaging(documentReferrer);
			var self = this;
			this.handshakeId = new Date().getTime();
			self.clientMessageService.publish(this.handshakeId, 'portal.initialHandshake');
		};

		this.publishAppSessionTokenName = function(appSessionTokenName) {
			if (!_.isUndefined(appSessionTokenName) && !_.isNull(appSessionTokenName)) {			
				this.clientMessageService.publish(appSessionTokenName, 'portal.storeAppSessionTokenNames');				
			}
		};

		/**
		 * Called by an app that wants to be called by the portal.  Here the initial handshake back to the portal is initiated, with the app (this)
		 * giving the portal its display name, and in return the portal will supply the app with a unique identifier.
		 */
		this.processLoginHandshake = function(documentReferrer, appDisplayName, appSessionTokenName) {
          if(!this.portalRegistrationDone){
			this.appDisplayName = appDisplayName;
			this.publishAppSessionTokenName(appSessionTokenName);

			if (!this.clientMessageService){
				this.setupMessaging(documentReferrer);
			}

			var self = this;

			var requestHandlers = {
					success : function(data) {
						var messageObj = $.parseJSON(data);
						//subscribe to messages from portal to this application
						self.clientMessageService.subscribe(self.openSettings, "openSettingsDialog-"+messageObj.appId);
						self.clientMessageService.subscribe(self.openHelp, "openHelpDialog-"+messageObj.appId);
						self.clientMessageService.subscribe(self.sessionLogout, "sessionLogout-"+messageObj.appId);
						self.clientMessageService.subscribe(self.receiveDisplayNotification, "portal.displayNotification-"+messageObj.appId);
						self.clientMessageService.subscribe(self.portalClickedNotification, 'portal.portalClickedNotification');
                        self.portalRegistrationDone = true;
					},
					error : function(payload) {
						throw new Error('Error handler: ' + payload);
					}
			};

			this.clientMessageService.request(requestHandlers, 'portalApplicationLoaded', '{"displayName":"'+appDisplayName+'", "handshakeId":"'+this.handshakeId+'"}');
          }
		};
	}

	return new PortalRegistrar();
});
