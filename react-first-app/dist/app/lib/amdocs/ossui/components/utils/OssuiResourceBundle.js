/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/OssuiResourceBundle.js#1 $ 
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

define('ossui/utils/OSSUIResourceBundle',[
    'underscore',
    'lightsaber' 
], function(_, Lightsaber) {

    var OSSUIResourceBundle = function(){};
    
    /**
     * The resourceBundle is maintained as static so that it can be
     * accesssed anywhere in the application after populating it
     * without having to instantiate the  OSSUIResourceBundle
     */
    OSSUIResourceBundle.prototype.resourceBundle = {};
    
    OSSUIResourceBundle.prototype.getLabel = function(key){
        return this.resourceBundle[key];
    };
    
    OSSUIResourceBundle.prototype.getMessage = function(messageKey){
        return this.resourceBundle[messageKey];
    };
    
    return OSSUIResourceBundle;
    
});