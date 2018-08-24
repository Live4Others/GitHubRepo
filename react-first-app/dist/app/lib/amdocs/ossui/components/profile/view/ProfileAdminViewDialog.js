/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/view/ProfileAdminViewDialog.js#1 $
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
define('ossui/widget/ProfileAdminViewDialog',[
	'jquery',
	'underscore',
	'lightsaber' ,
	'ossui/widget/ProfileAdminView',
	'ossui/widget/ModalDialogCallback',
	'ossui/utils/OSSUIResourceBundle'
], function($, _, Lightsaber, ProfileAdminView, ModalDialogCallback, OSSUIResourceBundle) {

	var ProfileAdminViewDialog = Lightsaber.PopupView.extend({
		config : {
			position : 'center',
			resizable : false,
			show: 'fade',
			hide: 'fade',
			modal: true,
			title: 'Save Profile',
			width : 435,
			height : 270,
			autoShow : true,
			autoRender:false,
			dialogClass : 'ossui-lightbox ossui-profiles ossui-admin-profile',
			buttons : [{
				text : 'Cancel',
				parentViewModel : this.viewModel,
				click : function(event) {
					ModalDialogCallback.trigger('CancelProfileClicked', event.timeStamp);
					//$( this ).dialog( "close" );
				}
			},
			{
				text : 'Save',
				parentViewModel : this.viewModel,
				click : function(event) {
					$($(this).parent().find('.ui-button')[1]).attr('disabled',true);
					ModalDialogCallback.trigger('SaveProfileClicked', event.timeStamp);
					//$( this ).dialog( "close" );
				}
			}],
			createContent : function (self) {
				self.contentView = new Lightsaber.Core.View({
					config: {
						template : '<div id="ossui-profileAdminView" class="ossui-profileAdminView"></div>'
					},
					viewModel : new Lightsaber.Core.ViewModel()
				});
				self.profileView = new ProfileAdminView({
					viewModel : self.viewModel,
					el : self.contentView.$el,

					config: {
						useCaseModelURL :'services/rest/profiles',
						profileViewTemplate: '' ,
						selectProfileInputTemplate: '',
						// pass in your own labels - if needed.
						labelDropdown: self.getConfig('labelDropdown'),
						labelInputText: self.getConfig('labelInputText')

					}

				});

				return self.contentView.$el;
			}
		},

		initialize: function(options) {
			_.bindAll(this,'saveClicked', 'cancelClicked');
			ModalDialogCallback.on('SaveProfileClicked',this.saveClicked);
			ModalDialogCallback.on('CancelProfileClicked',this.cancelClicked);
			this.config.counterOk = 0 ;
			this.config.counterSave = 0 ;
			this.config.callingModule = this.options.parent;
			if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.savetoglobal')) {
				this.config.buttons[1].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.savetoglobal');
			}
			if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.button.cancelString')) {
				this.config.buttons[0].text = OSSUIResourceBundle.prototype.getLabel('ossui.labels.button.cancelString');
			}
			if(OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.saveprofile')) {
				this.setConfig('title', OSSUIResourceBundle.prototype.getLabel('ossui.labels.profiles.button.saveprofile'));
			}
			this._super(options);
		},

		saveClicked :function() {
			/*this.config.counterOk = this.config.counterOk + 1 ;
				if (this.config.counterOk <= 1)
				{*/
			this.profileView.saveData(this);
			//}
		},

		cancelClicked : function(){
			this.profileView.cancelData(this);
		}
	});

	return ProfileAdminViewDialog;
});