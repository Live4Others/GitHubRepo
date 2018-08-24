/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/view/ProfileAdminView.js#1 $
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
define(
        'ossui/widget/ProfileAdminView',
        [       'underscore',
                'jquery',
                'lightsaber',
                'backbone',
                'ossui/widget/ProfileCollection',
                'ossui/widget/ProfileModel',
                'ossui/widget/ModalDialogView',
                'ossui/utils/OSSUIResourceBundle',
                'text!lib/amdocs/ossui/components/profile/view/template/ProfileAdminView.html',
                'text!lib/amdocs/ossui/components/profile/view/template/AdminProfileInputTemplate.html',
                'ossui/utils/OSSUIUtils',
                'ossui/widget/profile/InputTextViewValidated',
                'fixture.object', 'fixture.string', 'fixture.dom' ],
                /*jshint maxparams: 22 */
        function(_, $, Lightsaber, Backbone, ProfileCollection, ProfileModel, OSSUIModalDialog, OSSUIResourceBundle,
                DefaultProfileListViewTemplate, DefaultAdminProfileInputTemplate,OSSUIUtils ,InputTextViewValidated 
                ) {

            var ProfileShellCollection = ProfileCollection
            .extend({

                model : ProfileModel
            });
            
            var profileRegex = /^[a-zA-Z0-9 ]{0,100}$/;  // letters and spaces only 
            var ValidatedProfileModel = Lightsaber.Core.Model
            .extend({
                defaults : {
                    Profile : ''
                },
                url : '/aaa',
                validateOnly : 'false', // a flag helping us to avoid the "on blur" validation trigger
                validations : [ {
                    check : 'regExp',
                    pattern : profileRegex,
                    fieldName : 'Profile',
                    error : {
                        all : true
                    }
                } ]
            });
          var localValidatedProfileModel = new ValidatedProfileModel();
            
            var ProfileAdminView = Lightsaber.Core.View
                    .extend({
                        template : '',
                        config : {
                            useCaseModelURL : "n/a",
                            savedCollection : new ProfileShellCollection({parentObject : this})
                        },
                        initialize : function() {
                            _.bindAll(this, 'saveData', 'cancelData', 'handleRESTSyncSuccess', 'handleRESTSyncError', '_setSelectedProfile', 
                                    '_profilesFetchSuccesful', 'inputValidationError');
                            // url used by the [ProfileCollection] (passed
                            // further down at construction time)
                            this.profileModelURL = this.getConfig('useCaseModelURL') || this.config.useCaseModelURL; 

                            // templates used by this JS file 
                            this.template = this.getConfig('profileViewTemplate') || DefaultProfileListViewTemplate; 
                            this.config.selectProfileInputTemplate = this.getConfig('selectProfileInputTemplate') || DefaultAdminProfileInputTemplate;

                            this.config.labelDropdown = this.getConfig('labelDropdown') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.profiles.labelDropdown');
                            
                            this.config.labelInputText = this.getConfig('labelInputText') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.profiles.labelInputText');
                            
                            // lookups for error messages will start off from areas designated as "baseKeyFor.."
                            this.baseKeyForStatusBasedMessages =  this.getConfig('baseKeyForStatusBasedMessages') || "ossui.errorMessages";
                            this.baseKeyForCodeBasedMessages =  this.getConfig('baseKeyForCodeBasedMessages')  || "ann.search.ui.error.popup.servicefailure";

                            this.config.profileValidationErrorMessage = this.getConfig('profileValidationErrorMessage') ||
                            OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.validation.profile.name') ||
                            OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.validation.validate_pattern') ||
                            "Invalid {0} name or too many characters";

                        },
                        _postRender : function() {
                            this.cleanSavedCollections();
                            this.createProfileViews();
                            
                        },
                        cleanSavedCollections: function() {
                            this.config.savedCollection.reset();
                        }, 
                        /**
                         * gets the saved Collection 
                         */
                        getSavedCollection : function() {
                            return this.config.savedCollection;
                        },

                        /**
                         * gets the original  Collection 
                         */
                        getOriginalCollection : function() {
                            return this.config.originalCollection;
                        },

                        /**
                         * create  Views
                         */
                        createProfileViews : function() {
                            this.createAdminProfileView();
                        },

                        /**
                         * create save & clear buttons
                         */
                        profileModelURL : '',

                        
                        /**
                         * create the basic and additional item list view to
                         * show attribute information.
                         */
                        createAdminProfileView : function() {

                            
                            var self = this;
                            localValidatedProfileModel.set('Profile','');
                            var inputTextViewModelProfile = new Lightsaber.Core.ViewModel(
                                    {
                                        data : {
                                            labelProfile : self.config.labelInputText
                                        },
                                        models : {
                                            myModel : localValidatedProfileModel
                                        },
                                        dataBindings : [ {
                                            'Profile' : 'models.myModel.Profile',
                                            options : {
                                                setOnBind : true,
                                                twoWay : true
                                            }
                                        } ],
                                        config : {
                                            actions : {
                                                clearData : function() {
                                                    this.set("Profile", "");
                                                }
                                            }

                                        }
                                    });                            
                            
                            var validationErrorMessage = self.config.profileValidationErrorMessage.replace("{0}","Profile");
                            
                            var inputTextNewProfileName = new InputTextViewValidated({
                                viewModel : inputTextViewModelProfile,
                                id : 'inputTextView',
                                vmKeys : {
                                    "data.fieldValue" : "Profile",
                                    "data.label" : "labelProfile"
                                },
                                config : {
                                    el : this.$("[data-uxf-point='profileListViewText']"),
                                // Note: you can insert your own message by
                                // supplying an 'errorTextHandler' attribute
                                // errorTextHandler : function(model, error)
                                // {return "Profile has the wrong value"}
                                    errorTextHandler : this.inputValidationError
                                }
                            });
                            
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // preparatory steps for the REST Data source load
                            var ProfileRESTDataSource = new Lightsaber.Core.LSRESTDataSource({ 
                                defaults:{
                                    contentType: 'application/json',
                                    url: this.profileModelURL
                                },
                                update: {
                                    method: 'PUT'      
                                },
                                read: {
                                    method: 'GET'
                                },
                                create: {
                                    method: 'POST'
                                }
                            });
                                                        
                            this.config.savedCollection.setDataSource(ProfileRESTDataSource);
                            // create model for basic attribute list
                            var profileCollection = new ProfileCollection({
//                                url : this.profileModelURL
                                parentObject : this
                            });
                            var profileModel  = new ProfileModel();
                            profileModel.set({
                                 selectprofile : profileCollection
                            });
                            var adminProfileVM = new Lightsaber.Core.ViewModel({
                                data : {
                                    label : this.config.labelDropdown,
                                    fieldValue : 'models.myModel.id'
                                },
                                models : {
                                    // the options here is mandatory for select view, else UXF
                                    // throws
                                    // exception at runtime
                                    // the collection here is also the data displayed in
                                    // the view
                                    options : profileCollection,
                                    myModel : profileModel
                                },
                                dataBindings : [ {
                                    'fieldValue' : 'models.myModel.id',
                                    options : {
                                        setOnBind : true,
                                        twoWay : true
                                    }
                                } ],
                                config : {
                                    optionsModelName : "options",
                                    optionsValueFieldName : "id",
                                    optionsDisplayFieldName : "displayValue"
                                }
                            });
                            
                            var StylizedSelectViewAdmin = Lightsaber.SelectView.extend({

                                initialize : function(options) {

                                    this._super(options);

                                    this.viewModel.on('change:fieldValue', function(evt) {this._toggleStyle('popupclass2'); },this);
                                },
                                
                                enhanceMarkup : function(){
                                    /*this.$('select').css('margin', '0px');
                                    this.$('select').css('min-width', '120px');*/
                                },
                                /*
                                 * Helper function that toggles the style of the selected option
                                 */
                               _toggleStyle : function(elementName) {

                                   $('#' + elementName + ' select ').change(function () {
                                       $(this).find('option').css('background-color', 'transparent');
                                       $(this).find('option').css('color', 'black');
                                       $(this).find('option:selected').css('background-color', '#fe7550');  // background in reddish-orange
                                       $(this).find('option:selected').css('color', 'white');  // text in white 
                                       
                                   }).trigger('change');            

                            }
                                
                            });                            
                            
                            var adminProfileView = new  StylizedSelectViewAdmin ({
                                viewModel : adminProfileVM,
                                template: this.config.selectProfileInputTemplate,
                                id : 'selectView',
                                config : {
                                    el : this.$("[data-uxf-point='profileListViewSelect']"),
                                    template: this.config.selectProfileInputTemplate
                                },
                                attributes : {
                                    'data-theme' : 'a'
                                }
                            });

                            this.config.profileCollection = profileCollection;

                            // storing for later access
                            this.config.adminProfileView = adminProfileView;
                            this.config.adminProfileVM = adminProfileVM;
                            this.config.inputTextNewProfileName = inputTextNewProfileName; 

                            profileCollection.setDataSource(ProfileRESTDataSource);
                            profileCollection.on('SetSelectedProfile', this._setSelectedProfile);
                            profileCollection.on('ProfilesFetchSuccess', this._profilesFetchSuccesful);
                            profileCollection.fetch();

                            return adminProfileView;
                        },
                        inputValidationError : function(model,error) {
                            $(this.dialogInstance.$el.parent().find('.ui-button')[1]).removeAttr('disabled');
                            var validationErrorMessage = this.config.profileValidationErrorMessage.replace("{0}","Profile");
                            return validationErrorMessage;
                        },

                        cancelData : function(dialogInstance) {
                            if(!this.dialogInstance){
                                this.dialogInstance = dialogInstance;
                            }
                            this.dialogInstance.close();
                        },
                        
                        /* jshint maxcomplexity: 12 */
                        saveData : function(dialogInstance) {
                            if(!this.dialogInstance){
                                this.dialogInstance = dialogInstance;
                            }
                            this.cleanSavedCollections();
                            var restDS = this.config.savedCollection
                            .getDataSource();
                            
                            localValidatedProfileModel.validateOnly = "true";
                                                
                           var  typedInProfileName = $(
                                    "#inputTextView input")
                                    .val();
                            localValidatedProfileModel.attributes.Profile= typedInProfileName;

                            // elicit a change of "Profile"
                            $(
                                    "#inputTextView input")
                                    .trigger("change");
                            
                            // now validate 
                            var validationResultAge = localValidatedProfileModel
                                    .validate(
                                            localValidatedProfileModel.attributes,
                                            {
                                                api : 'isValid'
                                            });
                            
                            var errorsForValidatedProfileName = "";

                            if (!_
                                    .isUndefined(validationResultAge)) {
                                errorsForValidatedProfileName = validationResultAge.errors;

                            }
                            
                            if ($.isEmptyObject(typedInProfileName) === false && $.isEmptyObject(errorsForValidatedProfileName)) {
                                //Backbone encodes the URL automatically 
                                //var encodedTypedInValue = encodeURIComponent(typedInProfileName); 
                                restDS.setQueryParams({name : typedInProfileName});
                                //'create' --> corresponds to POST for the LSDataSource
                                try {// catching network errors and the like
                                    restDS
                                            .sync(
                                                    'create',
                                                    this.config.savedCollection,
                                                    {
                                                        contentType : 'application/json',
                                                        success : this.handleRESTSyncSuccess,
                                                        error : this.handleRESTSyncError
                                                    });
                                } catch (error) {
                                    this.handleGlobalError(error);
                                }

                            } 
                            if ($.isEmptyObject(typedInProfileName)) { 
                                // else if no new field had been typed in , 
                                //then send the selected entry from the dropdown list 

                                var selectedProfileId = this.config.adminProfileView
                                        .getData().fieldValue;
                                var selectedProfileValue = this
                                        .getDisplayValue(selectedProfileId);

                                // if value not found , then execute the reverse
                                // lookup
                                if ($.isEmptyObject(selectedProfileValue) === true) {
                                    selectedProfileValue = selectedProfileId;
                                    selectedProfileId = this
                                            .getIdValue(selectedProfileValue);

                                }
                                //use jquery to get selected data from the html element
                                if (!selectedProfileId) {                                    
                                    selectedProfileId = this.config.adminProfileView.$el.find('option:selected').val();
                                }
                                // if everything else failed , do select the
                                // first entry in the drop down list
                                if (!selectedProfileId) {
                                    selectedProfileValue = this.config.adminProfileView
                                            .getData().optionsData.items[0].displayValue;
                                    selectedProfileId = this.config.adminProfileView
                                            .getData().optionsData.items[0].id;
                                }
                                if(!restDS.defaults.url.match(':index')){
                                    restDS.defaults.url += '/:index';                                                    
                                 }
                                try { // catching network errors and the like
                                    restDS
                                            .sync(
                                                    'create',
                                                    this.config.savedCollection,
                                                    {
                                                        contentType : 'application/json',
                                                        params : {
                                                            index : selectedProfileId
                                                        },
                                                        success : this.handleRESTSyncSuccess,
                                                        error : this.handleRESTSyncError
                                                    });
                                }// end try  
                                catch (error) {
                                    this.handleGlobalError(error);
                                }

                            }

                        },
                        handleRESTSyncSuccess: function(){
                            //nothing more to be done so close dialog
                            if(this.dialogInstance){
                                this.dialogInstance.close();
                            }
                        },
                        handleRESTSyncError : function(serviceResponse){
                            // launch generic error popup window.
                            var windowTitle = OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.errorString');
                            var buttonText =  OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
                            //var localisedMessage = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.genericBEError');
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages
                            OSSUIUtils.launchErrorWindow(serviceResponse,windowTitle, buttonText,212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                            if(this.dialogInstance){
                                this.dialogInstance.close();
                            }
                        },
                        handleGlobalError : function(error) {
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages
                            OSSUIUtils.launchErrorWindow(error, null, null, 212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                        },

                        getDisplayValue : function(selectedItemId) {
                            var itemValue = '';

                            var itemsArray = this.config.adminProfileView
                                    .getData().optionsData.items;
                            for ( var k = 0; k < itemsArray.length; k++) {
                                if ((''+selectedItemId) === (''+itemsArray[k].id)) {
                                    itemValue = itemsArray[k].displayValue;
                                    break;
                                }
                            }
                            return itemValue;
                        },
                        _setSelectedProfile : function(eventData){
                            this.config.adminProfileView._setVMData('data.fieldValue',eventData.id);
                            if(eventData.id != this.config.adminProfileView.$el.find('select').find('option:selected').val()){
                                this.config.adminProfileView.$el.find('select').val(eventData.id) ;
                            }
                        },
                        
                        _profilesFetchSuccesful : function(){
                            //The select view has issues in IE if this inline attribute is present
                            //hence removeing it at the end
                            this.$('select').removeAttr('style');
                        },
                        
                        getIdValue : function(selectedValue) {
                            var itemId = '';

                            var itemsArray = this.config.adminProfileView
                                    .getData().optionsData.items;
                            for ( var k = 0; k < itemsArray.length; k++) {
                                if (selectedValue === itemsArray[k].displayValue) {
                                    itemId = ''+itemsArray[k].id;
                                    break;
                                }
                            }
                            return itemId;
                        }
                        
                        
                    });
            return ProfileAdminView;
        });
