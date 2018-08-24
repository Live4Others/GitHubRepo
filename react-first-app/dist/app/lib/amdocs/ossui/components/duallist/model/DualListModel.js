define(
        'ossui/widget/DualListModel',
        [ 'underscore', 'lightsaber' ], function(_, Lightsaber) {

    /**
     * Represents a record in the dual list  model,
     * The discriminator is the "status" field
     * "1" for the "current" (left) panel
     * "2" for the "available" (right) panel
     * 
     * The displayable value is "displayValue" 
     */
    var DualListModel = Lightsaber.Core.RESTModel.extend({

        defaults : {
            name : "default",
            
            // "1" for the "current" (left) panel
            // "2" for the "available" (right) panel
            status : "1 or 2",  
            
            displayValue : {
                value : -1
            }
        }

    });

    return DualListModel;
});
