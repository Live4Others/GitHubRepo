/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/modaldialog/view/ModalDialogView.js#1 $ 
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
define('ossui/widget/ModalDialogView',['jquery',
         'underscore',
         'lightsaber','ossui/widget/ModalDialogCallback'],
        function($, _, Lightsaber,ModalDialogCallback) {
            
            var ModalDialogView = Lightsaber.PopupView.extend({
                callbackvm : null,
                defaultdialogtemplate : '<div id="ossui-modaldialogview"><span>Do you want to save the changes?<span></div> ', 
                config : {
                    position : 'center',
                    resizable : false,
                    show: 'fade',
                    hide: 'fade',
                    modal: true,
                    title: 'Confirm',
                    width : 440,
                    height: 200,
                    autoRender:false,
                    autoShow : true,
                    dialogClass : 'ossui-lightbox ossui-modaldialog',
                    buttons : [  {
                                        text : 'Ok',
                                        click : function(event) {
                                            ModalDialogCallback
                                                    .trigger('OkClicked');
                                            $(this).dialog("close");
                                        }
                                    },

                                    {
                                        text : 'Cancel',
                                        click : function(event) {
                                            ModalDialogCallback
                                                    .trigger('CancelClicked');
                                            $(this).dialog("close");
                                        }
                                    }  ],
                    createContent : function (self){ 
                        self.contentView = new Lightsaber.Core.View({
                            config: {
                                template : '<div id="ossui-modaldialog" class="ossui-modaldialog"></div>'
                               // template : self.dialogtemplate
                            },
                            viewModel : new Lightsaber.Core.ViewModel()
                        });
                        var modalDialogView = new Lightsaber.Core.View({
                            config: {
                                template :  self.dialogtemplate
                            },
                            viewModel : new Lightsaber.Core.ViewModel(),
                            el : self.contentView.$el
                        });
                        return self.contentView.$el;
                      }
                },
                initialize: function(options) {
                    _.bindAll(this,'okClicked','cancelClicked');
                    ModalDialogCallback.on('OkClicked',this.okClicked);
                    ModalDialogCallback.on('CancelClicked',this.cancelClicked);
                    this.dialogtemplate = this.getConfig('dialogtemplate') || this.defaultdialogtemplate;
                    this.callbackvm = this.getConfig('callbackvm') ;
                    //if the entire config is customized by user
                    if( this.getConfig('modalconfig') ){
                        this.config = this.getConfig('modalconfig');
                    }
                    if(options){
                        this.setCustomConfigParams(options);
                    }                    
                    this._super();
                }  ,
                
                /**
                 * if customization of individual items in the modal dialog is needed
                 * it can be set by setting them in options
                 */
                /*jshint maxcomplexity: 7 */
                setCustomConfigParams : function(options){
                    if(options.title){
                        this.setConfig('title', options.title);
                    }
                    if(options.width){
                        this.setConfig('width', options.width);
                    }
                    if(options.height){
                        this.setConfig('height', options.height);
                    }
                    if(options.buttons){
                        this.setConfig('buttons', options.buttons);
                    }
                    if(options.dialogClass){
                        this.setConfig('dialogClass', options.dialogClass);
                    }
                },
                                
                okClicked : function(){
                    //the viewModel should register to the 'OkClicked' event
                    this.viewModel.trigger('OkClicked');
                },
                cancelClicked : function(){
                  //the viewModel should register to the 'CancelClicked' event
                    this.viewModel.trigger('CancelClicked');
                }
                
            });

            return ModalDialogView;
        });