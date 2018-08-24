 
define('ossui/widget/profile/InputTextViewValidated',
        [ 'lightsaber', 'underscore', 'jquery' ], 
        function(Lightsaber, _, $) {

    var InputTextViewValidated = Lightsaber.InputTextView.extend({

      events : {     // highjacking the change event because we need its validation to happen conditionally
                     "change" : "_changed"
                },
        initialize : function(options) {
            this._super(options);
            this.viewModel.on('bindingWarning:Profile',
                    this._processValidationProfile);
            //this.viewModel.on("change:Profile", function(evt) {this._toggleInputBoxBorder('inputTextView'); },this);
            
        },

        _processValidationProfile : function(viewModel, error, bindingObj) {
//            console.log('processing validation profile WARNING');
//             var inputPosition =  $('#profileListViewSave input ').eq(0).position();
//             var newtop = -65;
//             var newleft = +120; // inputPosition.left ;
             // Position the error messProfile overlaid above the input box
             $('#profileListViewSave div[data-uxf-point="LS-error"] ').eq(0).css({
                 'color': 'red'
//             'top': newtop ,
//             'left': newleft
             });
        },
        _changed: function(evt, val)  {
            val = this._getValue(evt);
            var validateOnlyModel = this.viewModel.models.myModel.validateOnly;
         //   console.log('changed to '+val +' when validateOnlyModel was '+validateOnlyModel);

            // the 'validateOnlyModel' flag helps us to avoid the "on blur" validation trigger.
            // We are trying to validate only when pressing the 'validation' button.
            if (validateOnlyModel === 'true')
                {
                this.viewModel.models.myModel.validateOnly = 'false';  
                this._super(evt, val);
                  
                }
            
            if ( _.isUndefined(validateOnlyModel) || validateOnlyModel === 'false')
            {
                return false ;
            }

        }
        

    });

    return InputTextViewValidated;
});
