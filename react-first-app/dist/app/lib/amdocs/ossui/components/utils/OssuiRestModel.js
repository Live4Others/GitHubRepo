/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/OssuiRestModel.js#1 $ 
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

define('ossui/utils/OSSUIRestModel',[
    'underscore',
    'lightsaber' 
], function(_, Lightsaber) {
    
    /**
     * @class: can be used by any class to make a rest call
     * a success and error response is triggered with the 
     * event name configured by the calling class. 
     */
    var ossuiRestModel = Lightsaber.Core.RESTModel.extend({

        options : {
            error : this.errorHandler,
            success : this.successHandler
        },
        //default 
        url: 'services/rest/ossui/config',
        
        modelInstanceData: '',
        
        initialize : function(options) {
            _.bindAll(this);
            Lightsaber.Core.Model.prototype.initialize.call(this);
            this.url = options.messageUrl || this.url;
            this.responseEvent = options.responseEvent || 'ConfigRestResponse';
            this.modelInstanceData = options.modelInstanceData || this.modelInstanceData;
        },

        successHandler : function(data, response) {
            this.set(response);
            this.trigger(this.responseEvent + ':success', response,this);
        },
        
        errorHandler : function(data, response) {
            // Error fetching the navigation module registry object. Using the default registry config.
            this.set(response);
            this.trigger(this.responseEvent + ':error', response, this);
        },
        
        fetch : function() {
            Lightsaber.Core.Model.prototype.fetch.call(this, {
                    success : this.successHandler,
                    error : this.errorHandler
                });
        }
    });
    return ossuiRestModel;
    
});