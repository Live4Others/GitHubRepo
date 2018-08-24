/**
* $Id: //depot/Applications/Cramer/Dev/Task-Branches/ossui-portal-stage/main/components/ossui-container-war/src/main/webapp/lib/amdocs/ossui/components/form/view/FormInputView.js#1 $ 
* $DateTime: 2013/10/16 13:43:14 $ 
* $Revision: #1 $ 
* $Change: 850842 $
*
* COPYRIGHT NOTICE:
* Copyright (c) 2013 Amdocs.
* The contents and intellectual property contained herein,
* remain the property of Amdocs.
* 
* */
define('ossui/widget/FormInputView',[
    'jquery',
    'underscore',
    'lightsaber',
    'ossui/utils/OSSUIResourceBundle',
    'text!lib/amdocs/ossui/components/form/view/templates/forminputviewtemplate.html'
], function($, _, Lightsaber, OSSUIResourceBundle, formInputViewTemplate) {


    var formInputView = Lightsaber.Core.View.extend({

        template : formInputViewTemplate,

        initialize : function(options) {
            _.bindAll(this,'_processInputError');	     
            _.template((this.getConfig('template') || this.template),this.viewModel.get('data'));            
            this.viewModel.on('inputError',this._processInputError );
        },
        
        enhanceMarkup : function(options){

            var header = this.$el.find('.ossui-user-field');
            // creating div element for inputfields
            for(var i=0; i<this.viewModel.models.data.attributes.inputfields.length; i++){
                var inputLabel = this.viewModel.models.data.attributes.inputfields[i].label;
                var inputFieldId = this.viewModel.models.data.attributes.inputfields[i].name;
                var inputFieldInput = 'inputFieldInput'+i;                
                $(header).append("<div id ='"+inputFieldId+"' class='ossui-forminput-text ossui-forminput-userLabel'>"+inputLabel+"</div>");
                $(header).append("<div id='"+inputFieldId+"' class='ossui-forminput-inputField ossui-forminput-userInput' data-uxf-point='"+inputFieldInput+"'></div>");
            }

            for(i=0; i<this.viewModel.models.data.attributes.inputfields.length; i++) {
                var inputFieldName = this.viewModel.models.data.attributes.inputfields[i].name;
                var inputField = 'inputFieldInput'+i;
                var inputNameText = 'inputNameText'+i;
                var inputText = new Lightsaber.InputTextView({
                    viewModel : this.viewModel,
                    id : inputNameText,
                    vmKeys : {
                        "data.fieldValue" : inputFieldName
                    },
                    config : {
                        el : this.$( '[data-uxf-point="'+inputField+'"]')
                    }
                });
            }
        },

        _processInputError : function(errorInputs){
            this.$el.parent().parent().find('.ui-button').attr('disabled',false);
            this.$('.ossui-forminput-error').css('display','block');
            var errorMessageId = this.viewModel.get('inputErrorMessageId');
            var errorDiv = this.$('#'+ errorMessageId);
            var message = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.invalid.forminput');            
            errorDiv.empty().append(message);		 
            var errorInputDiv = [];	
            for(var i=0; i<errorInputs.length; i++) {
                var inputId = errorInputs[i].name;
                errorInputDiv = this.$('#'+ inputId);
                $(errorInputDiv[0]).css('color','red');
            }
        }
      
    });
    return formInputView;
});