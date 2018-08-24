/**
 * $Id: //depot/Applications/Cramer/Dev/Task-Branches/ossui-portal-stage/main/components/ossui-container-war/src/main/webapp/lib/amdocs/ossui/components/form/view/FormInputDialog.js#1 $ 
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

define('ossui/widget/FormInputDialog',[
   'jquery',
   'underscore',
   'lightsaber',
   'ossui/widget/ModalDialogCallback',
   'ossui/widget/FormInputView',
   'ossui/utils/OSSUIResourceBundle'
   ], function($, _, Lightsaber, ModalDialogCallback, FormInputView,
		   OSSUIResourceBundle) {

	var formInputDialog = Lightsaber.PopupView.extend({
		config : {
			position : 'center',
			resizable : false,
			show: 'fade',
			hide: 'fade',
			modal: true,
			title: 'Form Input',
			width : 386,
			height: 230,
			autoRender:false,
			autoShow : true,
			dialogClass : 'ossui-lightbox ossui-forminput',
			draggable : false,
			buttons : [  {
				text : 'OK',
				click : function(event) {
					$(this).parent().find('.ui-button').attr('disabled',true);
					ModalDialogCallback.trigger('Ok',this);	
				}
			},
			{
				text : 'Cancel',
				click : function(event) {
					$(this).dialog('close');
					$(this).remove();
				}
			}],
			
			createContent : function (self){ 
				self.contentView = new Lightsaber.Core.View({
					config: {
						template : '<div id="ossui-forminputdialog" class="ossui-forminput"></div>'
					},
					viewModel : new Lightsaber.Core.ViewModel()
				});
				self.modalDialogView = new FormInputView({
					viewModel : self.viewModel,
					el : self.contentView.$el
				});
				return self.contentView.$el;
			}
		},
		
		initialize: function(options) {
			_.bindAll(this,'okClicked');
			ModalDialogCallback.on('Ok',this.okClicked);			
			this.config.buttons[0].text = this.viewModel.get('okButtonName');
			this.config.buttons[1].text = this.viewModel.get('cancelButtonName');
			this._super();
		},

		okClicked : function(dialogObj){            
			this.viewModel.save(dialogObj);
		},
		
		_prepareHeader : function(sd) {
            this._super(sd);
        }

	});
	return formInputDialog;
});
