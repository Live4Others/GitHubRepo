/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/model/ProfileModel.js#1 $
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
define('ossui/widget/ProfileModel',[ 'underscore', 'lightsaber' ], function(_, Lightsaber) {

    /**
     * Represents a record in the profiles model,
     * 
     * 
     * The displayable value is "displayValue"
     */
    var ProfileModel = Lightsaber.Core.RESTModel.extend({

        defaults : {
            id : "n/a",

            displayValue : {
                value : "n/a"
            }
        }

    });

    return ProfileModel;
});

