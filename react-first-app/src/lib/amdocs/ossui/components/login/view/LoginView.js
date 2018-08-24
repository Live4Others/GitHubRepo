/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/login/view/LoginView.js#1 $ 
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
define('ossui/widget/LoginView',[
    'jquery',
    'underscore',
    'lightsaber',
    'lib/amdocs/ossui/core/util/i18n/ossui-resource-bundle',
    'text!lib/amdocs/ossui/components/login/view/templates/loginviewtemplate.html'
], function($, _, Lightsaber, OssuiResourceBundle, loginViewTemplate) {


    var loginView = Lightsaber.Core.View.extend({

        template : loginViewTemplate,

        initialize : function(options) {
            _.bindAll(this,'_processErrorPasswd');
            _.template((this.getConfig('template') || this.template),this.viewModel.get('data'));            
            this.viewModel.on('loginError',this._processErrorPasswd);
        },
        
        enhanceMarkup : function(){
            var inputText1 = new Lightsaber.InputTextView({
                viewModel : this.viewModel,
                id : 'userNameText',
                vmKeys : {
                    "data.fieldValue" : "username"
                },
                config : {
                    el : this.$( '[data-uxf-point="userNameFieldInput"]')
                }
            });
            var inputText2 = new Lightsaber.InputTextView({
                viewModel : this.viewModel,
                id : 'passwordText',
                vmKeys : {
                    "data.fieldValue" : "password"
                },
                config : {
                    el : this.$( '[data-uxf-point="passwordFieldInput"]'),
                    inputAttributes : {
                        type : "password"
                    }
                }
            });           
            
        },
        _processErrorPasswd : function(){
           this.$el.parent().parent().find('.ui-button').attr('disabled',false);
           this.$('.ossui-login-error').css('display','block');
        }
      
    });
    return loginView;
});