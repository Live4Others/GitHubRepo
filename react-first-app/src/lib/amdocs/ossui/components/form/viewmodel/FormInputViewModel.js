define('ossui/widget/FormInputViewModel',[
      'underscore',
      'lightsaber',
      'ossui/utils/OSSUIResourceBundle'
      ], function(_, Lightsaber, OSSUIResourceBundle) {

	var formInputViewModel = Lightsaber.Core.ViewModel.extend({

		defaults:
		{            
			inputErrorMessageId :'inputerrormessageid',
			cancelButtonName    :'Cancel',
			okButtonName    :'OK'
		},

		initialize : function(options) {
			_.bindAll( this ,'overrideDefaults');
			this.overrideDefaults();
		},

		overrideDefaults: function(){

			var okButtonlabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
			if(okButtonlabel){
				this.set('okButtonName',okButtonlabel);
			}

			var cancelButtonLabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.cancelString');
			if(cancelButtonLabel){
				this.set('cancelButtonName',cancelButtonLabel);
			}

			for(var i=0; i<this.models.data.attributes.inputfields.length; i++) {			
				this.set('inputLabel'+i,this.models.data.attributes.inputfields[i].label);	
			}
			
			this.trigger('viewModelLoaded');
		},
		
		save : function(dialogObj){            
			var inputError = false;	
			var errorFields = [];	
			for(var i=0; i<this.models.data.attributes.inputfields.length; i++) {
				var inputField = this.models.data.attributes.inputfields[i];		 
				inputField.value = this.models.data.get(inputField.name);	 
				// do validation here if 'validate' is true
				if(this._validateInput(inputField) === true) {
					inputError = true;
					errorFields.push(inputField);
				} else {
					var inputId = inputField.name;
					var errorInputDiv = $(dialogObj).find('#'+ inputId);
					$(errorInputDiv[0]).css('color','#2f3538');
				}
			}	

			if(inputError === true) {
				this.trigger('inputError',errorFields);		
			} else {
				$(dialogObj).dialog("close");
				$(dialogObj).remove();
				this.trigger('inputSuccess');
				this.clear();
			}
		},
		
		clear : function() {
			for(var i=0; i<this.models.data.attributes.inputfields.length; i++) {
				var inputField = this.models.data.attributes.inputfields[i];	
				this.models.data.set(inputField.name,'');
			}
		},

		_validateInput: function(inputObject){
			if(!_.isUndefined(inputObject)) {
				if(inputObject.type === 'text' || inputObject.type === 'string') {
					return _.isEmpty(inputObject.value);
				} else if(inputObject.type === 'number' ) {
					if(!_.isEmpty(inputObject.value))
						return !isFinite(Number(inputObject.value));
					return true;					
				}
			}
		}

	});
	return formInputViewModel;
});