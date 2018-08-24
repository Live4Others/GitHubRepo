/*jshint devel:true */
define('ossui/widget/LoginViewModel',[
        'underscore',
        'lightsaber',
        'ossui/utils/OSSUIResourceBundle'
    ], function(_, Lightsaber, OSSUIResourceBundle) {

        var loginViewModel = Lightsaber.Core.ViewModel.extend({

            defaults:
            {
                userNameFieldId     :'usernamefieldid',
                passwordFieldId     :'passwordfieldid',
                loginErrorMessageId :'loginerrormessageid',
                cancelButtonName    :'Cancel',
                submitButtonName    :'Submit',
                passwordLabel       :'Password',
                usernameLabel       :'User Name'
            },

            initialize : function(options) {
                _.bindAll( this ,'overrideDefaults');
                this.overrideDefaults();
            },

            overrideDefaults: function(){

                var submitButtonlabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.submitString');
                if(submitButtonlabel){
                    this.set('submitButtonName',submitButtonlabel);
                }

               /* var cancelButtonLabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.cancelString');
                if(cancelButtonLabel){
                    this.set('cancelButtonName',cancelButtonLabel);
                }*/

                var passwordFieldLabel = OSSUIResourceBundle.prototype.getLabel('ossui.labels.login.password');
                if(passwordFieldLabel){
                    this.set('passwordLabel',passwordFieldLabel);
                }

                var usernameFieldLabel = OSSUIResourceBundle.prototype.getLabel('ossui.labels.login.username');
                if(usernameFieldLabel){
                    this.set('usernameLabel',usernameFieldLabel);
                }
                this.trigger('viewModelLoaded');

            } ,

            save : function(dialogObj){
                var self = this;
                self.dialogObj = dialogObj;
                self.models.myModel.save(null,{
                    success : function(){
                       self.trigger('loginSuccess');
                       $(self.dialogObj).dialog("close");
                    },
                    error :  function(originalModel, resp, options){
                       self.trigger('loginError',resp);
                    }
                });
            },
           cancel : function(dialogObj){
               this.models.myModel.set('username','');
               this.models.myModel.set('password','');
               $(dialogObj).find('[data-uxf-point="userNameFieldInput"] [data-uxf-point="LS-error"]').empty();
               $(dialogObj).find('[data-uxf-point="passwordFieldInput"] [data-uxf-point="LS-error"]').empty();
           } 
           
           });
    return loginViewModel;
    });