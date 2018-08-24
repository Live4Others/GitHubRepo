/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/utils/OssuiConfigData.js#1 $ 
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

define('ossui/utils/OSSUIConfigurationData',[
    'underscore',
    'lightsaber' 
], function(_, Lightsaber) {

    var OSSUIConfigurationData = function(){};
    
    /**
     * The resourceBundle is maintained as static so that it can be
     * accesssed anywhere in the application after populating it
     * without having to instantiate the  OSSUIResourceBundle
     */
    OSSUIConfigurationData.prototype.configMap = {};
    
    /**
     * Returns the config param based on the two level of info sent as key
     * e.g. if the 'maxNoOfTabs' config data for the OSSUI application is needed
     * the query should be OSSUIConfigurationData.prototype.getConfig('OSSUI','maxNoOfTabs')
     * The appName follows the name sent in the URL for the REST call to retrieve the 
     * configuration
     */
    OSSUIConfigurationData.prototype.getConfig = function(appName, key){
        if(this.configMap[appName]){
            return this.configMap[appName][key];
        }else{
            return "";
        }
    };    
    
    return OSSUIConfigurationData;
    
});