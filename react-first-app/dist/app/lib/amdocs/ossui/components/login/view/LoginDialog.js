/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/login/view/LoginDialog.js#1 $ 
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

define('ossui/widget/LoginDialog',[
    'jquery',
    'underscore',
    'lightsaber',
    'ossui/widget/ModalDialogCallback',
    'ossui/widget/LoginView',
    'ossui/utils/OSSUIResourceBundle'
], function($, _, Lightsaber, ModalDialogCallback, LoginView,
        OSSUIResourceBundle) {

    var loginView = Lightsaber.PopupView.extend({
        config : {
            position : 'center',
            resizable : false,
            show: 'fade',
            hide: 'fade',
            modal: true,
            title: 'Login',
            width : 386,
            height: 230,
            autoRender:false,
            autoShow : true,
            dialogClass : 'ossui-lightbox ossui-login',
            draggable : false,
            buttons : [  {
                                text : 'login',
                                click : function(event) {
								$(this).parent().find('.ui-button').attr('disabled',true);
                                    ModalDialogCallback
                                            .trigger('OkClicked',this);
                                }
                            }/*,

                            {
                                text : 'cancel',
                                click : function(event) {
                                    ModalDialogCallback
                                            .trigger('CancelClicked',this);
                                }
                            } */ ],
            createContent : function (self){ 
                self.contentView = new Lightsaber.Core.View({
                    config: {
                        template : '<div id="ossui-logindialog" class="ossui-logindialog"></div>'
                    },
                    viewModel : new Lightsaber.Core.ViewModel()
                });
                self.modalDialogView = new LoginView({
                    viewModel : self.viewModel,
                    el : self.contentView.$el
                });
                return self.contentView.$el;
              }
        },
        initialize: function(options) {
            _.bindAll(this,'okClicked');
            ModalDialogCallback.on('OkClicked',this.okClicked);
            this.productInfo = options.productInfo || 'AMDOCS OSS';
           // ModalDialogCallback.on('CancelClicked',this.cancelClicked);
            //change the buttons names to the ones in resource bundle
            var tempButt = this.getConfig('buttons');
            tempButt[0].text = this.viewModel.get('submitButtonName');
            this.setConfig('buttons', tempButt);
            //this.config.buttons[1].text = this.viewModel.get('cancelButtonName');
            this.setConfig('title', OSSUIResourceBundle.prototype.getLabel('ossui.labels.heading.login') || 'Login');
            this._super();
        }  ,
        
        okClicked : function(dialogObj){
            this.viewModel.save(dialogObj);
        },
        
        /**
         * Overwritten this class from Lightsaber.PopupView to add extra product header to the login
         * @param sd : element
         */
        _prepareHeader : function(sd) {
            this._super(sd);
            var header = $(sd).parent().children().first();
            $(header).prepend("<div class='ossui-product-info'></div>");
            $(header).find('.ui-dialog-title').addClass('ossui-login-title');
            if(this.options.productInfoClass){
                $(header).find('.ossui-product-info').addClass(this.options.productInfoClass);
            }
            //add the product info
            $(header).find('.ossui-product-info').html(this.productInfo);
        }
        
    
    });
    return loginView;
});
