/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/ossui-locale-reader.js#1 $ 
* $DateTime: 2017/06/08 19:26:36 $ 
* $Revision: #1 $ 
* $Change: 1837971 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */

define('ossui/utils/OSSUILocaleReader',[
    'underscore',
    'lightsaber',
    'backbone',
    'ossui/utils/OSSUIRestModel',
    'ossui/utils/OSSUIResourceBundle','ossui/utils/OSSUIUtils'
], function(_, Lightsaber, Backbone,  OSSUIRestModel, OSSUIResourceBundle,OSSUIUtils) {
    
    var OSSUILocaleReader = function(options){
        /**
         * options.messagesUrlList -- specify the list of urls to fetch asynchronously
         * options.cacheBundleValues -- if value is boolean:true then the bundle keys are cached in session storage
         * options.callbackAfterRestoringCachedValues -- callback method which will be called after the resources are restored
         * from session storage. If atleast one new REST call is made then the "resourceBundleCreated" 
        **/
        this.errorResponses = [];
        
        this.bundleNames = [];
        
        this.handleGlobalError = function(error) {
            // method signature looks like this :
            // function(response, windowTitle,
            //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedErrorMessages baseKeyForCodeBasedErrorMessages)
            OSSUIUtils.launchErrorWindow(error, null, null, 212,null,"ossui.errorMessages","ann.search.ui.error.popup.servicefailure");
        };
       
       this.getResourceContent = function(messagesUrlList){
           if(this.cacheBundleValues){
                this.checkBundleValuesCacheElseFetch(messagesUrlList);
           }else{
                this.getResourceContentFromREST(messagesUrlList);
           }
       };
        
       this.checkBundleValuesCacheElseFetch = function(urlList){
            var urlListForFetch = [];
            for ( var id in urlList) {
                var url = urlList[id];
                if(sessionStorage.getItem(url) !== null){
                        this.setBundlesValuesInOSSUIResourceBundle(JSON.parse(sessionStorage.getItem(url)));            
                }else{
                     urlListForFetch.push(url);                   
                }
            }
           if(urlListForFetch.length > 0){
                this.getResourceContentFromREST(urlListForFetch);
          }else{
                //call registered callback 
                if(_.isFunction(options.callbackAfterRestoringCachedValues)){
                    options.callbackAfterRestoringCachedValues();
                }
          }
       };
       this.getResourceContentFromREST = function(messagesUrlList){
          
           for ( var msgUrl in messagesUrlList) {
               if(messagesUrlList[msgUrl]){
                   var startIndex = messagesUrlList[msgUrl].lastIndexOf('/');
                   var bundleName = messagesUrlList[msgUrl].substring(messagesUrlList[msgUrl]
                           .lastIndexOf('/') + 1, messagesUrlList[msgUrl].length);
                   this.bundleNames.push(bundleName);
                   
                   var restModel = new Lightsaber.Core.RESTModel({},{url:messagesUrlList[msgUrl], rest: {read: {method:'GET', contentType:'application/json'}}});
                 
                   try {
                     
                        restModel.fetch({success:this.responseSuccessHandler, error:this.responseErrorHandler});
                   }
                   catch (error) {
                       this.handleGlobalError(error);
                   }
                   //restModel.fetch();
                   }
               }            
        };
        
        this.responseSuccessHandler = function(restModelInstance, messages ){
           var restUrlRoot = restModelInstance.urlRoot;
           var bundleName = restUrlRoot.substring(restUrlRoot.lastIndexOf('/') + 1, restUrlRoot.length);
           if(this.cacheBundleValues){
            sessionStorage.setItem(restUrlRoot,JSON.stringify(messages));
           }
           this.setBundlesValuesInOSSUIResourceBundle(messages);
            //OSSUIResourceBundle.prototype.resourceBundle = parsedMessages;
            this.sendResourceBundleCreatedEvent(bundleName);
        };   
        
        this.responseErrorHandler = function(model,response, restModelInstance){
            this.errorResponses.push(response);
            var restUrlRoot = restModelInstance.urlRoot;
            var bundleName = [];
            if(restUrlRoot) {
                bundleName = restUrlRoot.substring(restUrlRoot.lastIndexOf('/') + 1, restUrlRoot.length);
            }
            this.sendResourceBundleCreatedEvent(bundleName);
            // raise a popup error message when response holds an error code like "401" - aka "unauthorized access" 
            // Note - default window params will be calculated automatically (including the message)
            // signature looks like this :
            // function(response, windowTitle,
            //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedErrorMessages ,baseKeyForCodeBasedErrorMessages
            if(bundleName.length !== 0) {
                OSSUIUtils.launchErrorWindow(response, null, null, 212, null,"ossui.errorMessages","ann.search.ui.error.popup.servicefailure");
            }
        };
        this.setBundlesValuesInOSSUIResourceBundle = function(messages){
             for(var message in messages){
                if(message) {
                    OSSUIResourceBundle.prototype.resourceBundle[message] = messages[message];
                }
            }
        };
        /**
         * The below method acts like a semaphore and prevents both the error and success
         * handlers from simultaneously popping data out of the array causing threading issues
         * Javascript being single threaded in a browser the below method cannot be called
         * simultaneously by both the handlers
         */
        this.sendResourceBundleCreatedEvent = function(bundleName){
            if(bundleName){
                this.bundleNames.splice(this.bundleNames.indexOf(bundleName),1);
            }
            if(this.bundleNames.length === 0) {
                this.trigger('resourceBundleCreated' , this.errorResponses);
            }
        };
        
        _.bindAll(this,'responseSuccessHandler', 'responseErrorHandler', 'sendResourceBundleCreatedEvent');       
    
        if(options.messagesUrlList) {
            this.cacheBundleValues = !_.isUndefined(options.cacheBundleValues) ? options.cacheBundleValues :false;
            this.getResourceContent(options.messagesUrlList);               
        }
    };
  _.extend(OSSUILocaleReader.prototype, Backbone.Events, {});
  
    return OSSUILocaleReader;
    
});
