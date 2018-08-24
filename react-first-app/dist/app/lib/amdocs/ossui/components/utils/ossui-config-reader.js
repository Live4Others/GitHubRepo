/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/ossui-config-reader.js#1 $ 
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

define('ossui/utils/OSSUIConfigReader', [ 'underscore', 'lightsaber',
        'backbone', 'ossui/utils/OSSUIRestModel',
        'ossui/utils/OSSUIConfigurationData'], function(_, Lightsaber,
        Backbone, OSSUIRestModel, OSSUIConfigurationData) {

    var OSSUIConfigReader = function(options) {
       
        this.errorResponses = [];
        
        this.applications = [];
        
        this.getConfigDataViaREST = function(configUrlList) {
            //_.bindAll(this,'responseSuccessHandler');
            for ( var configUrl in configUrlList) {
                        if (configUrlList[configUrl]) {
                            var startIndex = configUrlList[configUrl]
                                    .lastIndexOf('/');
                            var application = configUrlList[configUrl]
                                    .substring(configUrlList[configUrl]
                                            .lastIndexOf('/') + 1,
                                            configUrlList[configUrl].length);
                            this.applications.push(application);
                            var restModel = new Lightsaber.Core.RESTModel();
                            var rESTDS = new Lightsaber.Core.LSRESTDataSource(
                                    {
                                        defaults : {
                                            contentType : 'application/json',
                                            url : configUrlList[configUrl]
                                        },
                                        update : {
                                            method : 'PUT'
                                        },
                                        read : {
                                            method : 'GET'
                                        },
                                        create : {
                                            method : 'POST'
                                        }
                                    });
                            restModel.on('ossuiConfigurationLoad:success',
                                    this.responseSuccessHandler);
                            restModel.on('ossuiConfigurationLoad:error',
                                    this.responseErrorHandler);
                            restModel.setDataSource(rESTDS);
                            rESTDS.sync('read', restModel, {
                                contentType : 'application/json',
                                success : this.responseSuccessHandler,
                                error : this.responseErrorHandler
                            });
                            //restModel.fetch();
                        }
            }
        };

        this.responseSuccessHandler = function(eventData, restModelInstance){           
            var parsedMessages = {};
            for(var message in eventData.configData){
                if(message) {
                parsedMessages[message] = eventData.configData[message];
                }
            }
            OSSUIConfigurationData.prototype.configMap[restModelInstance.modelInstanceData] = parsedMessages;
            this.sendConfigRetrievedEvent(restModelInstance.modelInstanceData);
        };   
        
        this.responseErrorHandler = function(response, restModelInstance){
            this.errorResponses.push(response);
            this.sendConfigRetrievedEvent(restModelInstance.modelInstanceData);
        };
        /**
         * The below method acts like a semaphore and prevents both the error and success
         * handlers from simultaneously popping data out of the array causing threading issues
         * Javascript being single threaded in a browser the below method cannot be called
         * simultaneously by both the handlers
         */
        this.sendConfigRetrievedEvent = function(appName){
            this.applications.pop(appName);
            if(this.applications.length === 0) {
                this.trigger('ossuiConfigurationLoaded' , this.errorResponses);
            }
        };

        _.bindAll(this, 'responseSuccessHandler', 'responseErrorHandler');

        if (options.configUrlList) {
            this.getConfigDataViaREST(options.configUrlList);
        }
    };
    _.extend(OSSUIConfigReader.prototype, Backbone.Events, {});

    return OSSUIConfigReader;

});