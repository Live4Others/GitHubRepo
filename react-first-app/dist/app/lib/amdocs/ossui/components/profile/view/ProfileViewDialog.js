/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/view/ProfileViewDialog.js#1 $
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
define('ossui/widget/ProfileViewDialog',
    [ 'jquery',
        'underscore',
        'lightsaber' ,
        'ossui/widget/ProfileView',
        'ossui/widget/ModalDialogCallback',
        'ossui/utils/OSSUIResourceBundle',
        'ossui/widget/ProfileAdminViewDialog'],

    function($, _, Lightsaber, ProfileView, ModalDialogCallback, OSSUIResourceBundle, ProfileAdminViewDialog) {

        var ProfileViewDialog = Lightsaber.PopupView.extend({
            config : {
                position : 'center',
                resizable : false,
                show: 'fade',
                hide: 'fade',
                modal: true,
                title: 'Select Display Profile',
                width : 435,
                height : 220,
                autoShow : true,
                autoRender:false,
                dialogClass : 'ossui-lightbox ossui-profiles ossui-nonadmin-profile',
                buttons : [
                    {
                        text : 'Save to Global',
                        parentViewModel : this.viewModel,
                        click : function(event) {
                            ModalDialogCallback.trigger('SaveGlobalClicked', event.timeStamp);
                            //$( this ).dialog( "close" );
                        }
                    },

                    {
                        text : 'Reset to Default',
                        parentViewModel : this.viewModel,
                        click : function(event) {
                            ModalDialogCallback.trigger('ResetClicked', event.timeStamp);
                            //$( this ).dialog( "close" );
                        }
                    },
                    {
                        text : 'Select',
                        parentViewModel : this.viewModel,
                        click : function(event) {
                            ModalDialogCallback.trigger('SelectClicked', event.timeStamp);
                            //$( this ).dialog( "close" );
                        }
                    }
                ],
                createContent : function (self){
                    self.contentView = new Lightsaber.Core.View({
                        config: {
                            template : '<div id="ossui-profileView" class="ossui-profileView"></div>'
                        },
                        viewModel : new Lightsaber.Core.ViewModel()
                    });
                    self.profileView = new ProfileView({
                        viewModel : self.viewModel,
                        el : self.contentView.$el,

                        config: {
                            useCaseModelURL :'services/rest/profiles',
                            profileViewTemplate: '' ,
                            selectProfileInputTemplate: '' ,
                            // pass in your own labels - if needed.
                            labelDropdown: self.getConfig('labelDropdown'),
                            labelInputText: self.getConfig('labelInputText')
                        }

                    });
                    //this.viewData = self.modalDialogView;
                    return self.contentView.$el;
                }
            },
            render : function(){
                this._super();
                var self = this;
                //when the dialog is rendered on screen check to see if the width needs to be increased for localisation
                 setTimeout(function() {
                     var totalButtonTextLength = self.config.buttons[0].text.length + self.config.buttons[1].text.length + self.config.buttons[2].text.length;
                     //if more than the english button text length
                     if (totalButtonTextLength > 36){
                         //multiply up the difference to increase the width of the window
                         var difference = totalButtonTextLength - 36;
                         var extraWidth = difference * 7;
                         var newWidthNum = 435+extraWidth;
                         self.$el.parent().css('width', newWidthNum+'px');
                     }
                 }, 0);    
            },
            initialize: function(options) {
                _.bindAll(this,'selectClicked', 'resetClicked' ,'saveGlobalClicked');
                ModalDialogCallback.on('SelectClicked',this.selectClicked);
                ModalDialogCallback.on('ResetClicked',this.resetClicked);
                ModalDialogCallback.on('SaveGlobalClicked',this.saveGlobalClicked);
                this.config.counterOk = 0 ;
                this.config.counterSave = 0 ;
                this.config.callingModule = this.options.parent;
                if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.savetoglobal')) {
                    this.config.buttons[0].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.savetoglobal');
                }
                if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.cancelString')) {
                    this.config.buttons[1].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.cancelString');
                }
                if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.selectString')) {
                    this.config.buttons[2].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.selectString');
                }
                this.setConfig('buttons', this.config.buttons);
                if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.display.title')) {
                    this.setConfig('title', OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.display.title'));
                }
                this.adminView = new ProfileAdminViewDialog({
                    viewModel : new Lightsaber.Core.ViewModel(),
                    config : {
                        // pass in your own labels - if needed.
                        labelDropdown : this
                            .getConfig('labelDropdown'),
                        labelInputText : this
                            .getConfig('labelInputText')
                    }
                });
                this._super(options);
            },

            selectClicked :function(){

                /*this.config.counterOk = this.config.counterOk + 1 ;
                 if (this.config.counterOk <= 1)
                 {*/
                this.profileView.saveData(this);
                /*}*/

            },

            resetClicked : function(){
                this.profileView.resetData(this);
            },

            saveGlobalClicked : function(){
                /*this.config.counterSave = this.config.counterSave + 1 ;
                 if (this.config.counterSave <= 1)
                 {*/
                this.close();
                this.adminView.render();
                /*}*/
            }
        });

        return ProfileViewDialog;
    });