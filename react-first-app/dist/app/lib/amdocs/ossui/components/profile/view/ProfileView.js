/**
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/profile/view/ProfileView.js#1 $
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
    'ossui/widget/ProfileView',
    [       'underscore',
        'jquery',
        'lightsaber',
        'backbone',
        'ossui/widget/ProfileCollection',
        'ossui/widget/ProfileModel',
        'ossui/widget/ModalDialogView',
        'ossui/utils/OSSUIResourceBundle',
        'text!lib/amdocs/ossui/components/profile/view/template/ProfileView.html',
        'text!lib/amdocs/ossui/components/profile/view/template/SelectProfileInputTemplate.html',
        'text!lib/amdocs/ossui/components/buttons/view/templates/OSSUIDefaultButtonTemplate.html',
        'ossui/utils/OSSUIUtils',
        'fixture.object', 'fixture.string', 'fixture.dom' ],
    /*jshint maxparams: 12 */
    function(_, $, Lightsaber, Backbone, ProfileCollection, ProfileModel, OSSUIModalDialog, OSSUIResourceBundle,
             DefaultProfileListViewTemplate, DefaultSelectProfileInputTemplate,
             ossuidefaultbuttontempl,OSSUIUtils) {

        var ProfileShellCollection = ProfileCollection
            .extend({

                model : ProfileModel
            });

        var ProfileView = Lightsaber.Core.View
            .extend({
                template : '',
                config : {
                    savedCollection : new ProfileShellCollection({parentObject : this})
                },
                initialize : function() {
                    _.bindAll(this, 'saveData', 'resetData', 'handleRESTSyncSuccess', 'handleRESTSyncError',
                        '_setSelectedProfile','handleResetProfileSuccess', '_profilesFetchSuccesful');
                    // url used by the [ProfileCollection]
                    this.profileModelURL = this.getConfig('useCaseModelURL') ;

                    // template used by this JS file [profiles list view]
                    this.template = this.getConfig('profileViewTemplate') || DefaultProfileListViewTemplate;
                    this.config.selectProfileInputTemplate = this.getConfig('selectProfileInputTemplate') || DefaultSelectProfileInputTemplate;

                    this.config.labelDropdown = this.getConfig('labelDropdown') ||
                        OSSUIResourceBundle.prototype.getMessage('ossui.labels.profiles.default.labelDropdown');

                    this.showSaveAlert = this.getConfig('showSaveAlert');

                    // lookups for error messages will start off from areas designated as "baseKeyFor.."
                    this.baseKeyForStatusBasedMessages =  this.getConfig('baseKeyForStatusBasedMessages') || "ossui.errorMessages";
                    this.baseKeyForCodeBasedMessages =  this.getConfig('baseKeyForCodeBasedMessages') || "ossui.errorMessages.errorCode";

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
                    this.createSelectProfileView();
                },

                /**
                 * create save & clear buttons
                 */
                profileModelURL : '',

                /**
                 * create the basic and additional item list view to
                 * show attribute information.
                 */
                createSelectProfileView : function() {


                    // ~~~~~~~~~~~~~~~~~~~
                    // preparatory steps for the REST Data source load
                    var ProfileRESTDataSource = new Lightsaber.Core.LSRESTDataSource({
                        defaults:{
                            contentType: 'application/json',
                            url:this.profileModelURL
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
                        //url : this.profileModelURL
                        parentObject : this
                    });

                    var profileModel  = new ProfileModel();
                    profileModel.set({
                        selectprofile : profileCollection
                    });
                    var selectProfileVM = new Lightsaber.Core.ViewModel({
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
                            // significance of below attribute for select box
                            // to be clarified with UXF experts
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

                    var StylizedSelectView = Lightsaber.SelectView.extend({

                        initialize : function(options) {

                            this._super(options);

                            this.viewModel.on('change:fieldValue', function(evt) {this._toggleStyle('popupclass'); },this);
                        },
                        /**
                         * some css changes which are getting set for the select element
                         */
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

                    var selectProfileView = new  StylizedSelectView ({
                        viewModel : selectProfileVM,
                        template: this.config.selectProfileInputTemplate,
                        id : 'selectView',
                        config : {
                            el : this.$("[data-uxf-point='profileListView']"),
                            template: this.config.selectProfileInputTemplate
                        },
                        attributes : {
                            'data-theme' : 'a'
                        }
                    });

                    this.config.profileCollection = profileCollection;

                    // storing for later access
                    this.config.selectProfileView = selectProfileView;
                    this.config.selectProfileVM = selectProfileVM;
                    profileCollection.setDataSource(ProfileRESTDataSource);
                    profileCollection.fetch();
                    profileCollection.on('SetSelectedProfile', this._setSelectedProfile);
                    profileCollection.on('ProfilesFetchSuccess', this._profilesFetchSuccesful);

                    return selectProfileView;
                },

                resetData : function(dialogInstance) {
                    if (!this.dialogInstance) {
                        this.dialogInstance = dialogInstance;
                    }
                    try {
                        this.config.savedCollection.reset();
                        var selectedProfileId = this.config.selectProfileView
                            .getData().fieldValue;
                        var selectedProfileValue = this
                            .getDisplayValue(selectedProfileId);
                        // if value not found , then execute the reverse lookup
                        if ($.isEmptyObject(selectedProfileValue) === true) {
                            selectedProfileValue = selectedProfileId;
                            selectedProfileId = this
                                .getIdValue(selectedProfileValue);

                        }
                        //use jquery to get selected data from the html element
                        if (!selectedProfileId) {
                            selectedProfileId = this.config.selectProfileView.$el.find('option:selected').val();
                        }
                        var restDS = this.config.savedCollection
                            .getDataSource();
                        // below if condition will not allow duplicate
                        // addition of index
                        if (!restDS.defaults.url.match(':index')) {
                            restDS.defaults.url += '/:index';
                        }
                        restDS.setQueryParams({
                            resetProfile : true
                        });
                        this.profileIdForReset = selectedProfileId;
                        // method 'update' --> corresponds to PUT
                        restDS
                            .sync(
                            'update',
                            this.config.savedCollection,
                            {
                                contentType : 'application/json',
                                params : {
                                    index : selectedProfileId
                                },
                                success : this.handleResetProfileSuccess,
                                error : this.handleRESTSyncError
                            });
                    }// end try
                    catch (error) {
                        this.handleGlobalError(error);
                    }
                },
                /*jshint maxcomplexity: 7 */
                saveData : function(dialogInstance) {
                    if (!this.dialogInstance) {
                        this.dialogInstance = dialogInstance;
                    }
                    try {
                        this.config.savedCollection.reset();
                        var selectedProfileId = this.config.selectProfileView
                            .getData().fieldValue;
                        var selectedProfileValue = this
                            .getDisplayValue(selectedProfileId);

                        // if value not found , then execute the reverse lookup
                        if ($.isEmptyObject(selectedProfileValue) === true) {
                            selectedProfileValue = selectedProfileId;
                            selectedProfileId = this
                                .getIdValue(selectedProfileValue);

                        }
                        //use jquery to get selected data from the html element
                        if (!selectedProfileId) {
                            selectedProfileId = this.config.selectProfileView.$el.find('option:selected').val();
                        }
                        // if everything else failed , do select the
                        // first entry in the drop down list
                        if (!selectedProfileId) {
                            selectedProfileValue = this.config.selectProfileView
                                .getData().optionsData.items[0].displayValue;
                            selectedProfileId = this.config.selectProfileView
                                .getData().optionsData.items[0].id;
                        }

                        var restDS = this.config.savedCollection
                            .getDataSource();
                        if (!restDS.defaults.url.match(':index')) {
                            restDS.defaults.url += '/:index';
                        }

                        restDS.setQueryParams({});
                        restDS
                            .sync(
                            'update',
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

                },
                handleRESTSyncSuccess : function() {
                    //nothing more to be done so close dialog
                    if(this.dialogInstance){
                        this.dialogInstance.close();
                    }
                },
                handleRESTSyncError : function(serviceResponse){
                    if (this.profileIdForReset){
                        this.profileIdForReset = null;
                    }
                    var windowTitle = OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.errorString');
                    var buttonText =  OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
                    //  var localisedMessage = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.genericBEError');
                    OSSUIUtils.launchErrorWindow(serviceResponse,windowTitle, buttonText,212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                    if(this.dialogInstance){
                        this.dialogInstance.close();
                    }
                },
                handleGlobalError : function(error) {
                    // signature looks like this :
                    // function(response, windowTitle,
                    //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedMessages , baseKeyForCodeBasedMessages) {
                    OSSUIUtils.launchErrorWindow(error, null, null, 212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                },
                handleResetProfileSuccess : function(){
                    if(this.dialogInstance){
                        this.dialogInstance.close();
                    }
                    if(this.profileIdForReset){
                        var jQVarForOptionSelect = 'option[value=' + this.profileIdForReset + ']';
                        var optionText = this.config.selectProfileView.$el.find(jQVarForOptionSelect).text();
                        var optionTextTrunc = optionText.substr(0,optionText.indexOf(' *'));
                        this.config.selectProfileView.$el.find(jQVarForOptionSelect).text(optionTextTrunc);
                        this.profileIdForReset = null;
                    }
                },

                _setSelectedProfile : function(eventData){
                    //this.config.selectProfileView._setValue(eventData.id);
                    /*The below line does not work for IE 9 hence setting the data manually in
                     * the select box
                     * */
                    this.config.selectProfileView._setVMData('data.fieldValue',eventData.id);
                    if(eventData.id != this.config.selectProfileView.$el.find('select').find('option:selected').val()){
                        this.config.selectProfileView.$el.find('select').val(eventData.id) ;
                    }
                },

                _profilesFetchSuccesful : function(){
                    //The select view has issues in IE if this inline
                    //attribute is present
                    this.$('select').removeAttr('style');
                },

                getDisplayValue : function(selectedItemId) {
                    var itemValue = '';

                    var itemsArray = this.config.selectProfileView
                        .getData().optionsData.items;
                    for ( var k = 0; k < itemsArray.length; k++) {
                        if ((''+selectedItemId) === (''+itemsArray[k].id)) {
                            itemValue = itemsArray[k].displayValue;
                            break;
                        }
                    }
                    return itemValue;
                },
                getIdValue : function(selectedValue) {
                    var itemId = '';

                    var itemsArray = this.config.selectProfileView
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
        return ProfileView;
    });
