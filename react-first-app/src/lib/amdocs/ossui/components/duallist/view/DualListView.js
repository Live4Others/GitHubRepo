/*jshint maxcomplexity:15  */
define(
        'ossui/widget/DualListView',
        [       'underscore',
                'jquery',
                'lightsaber',
                'backbone',
                'ossui/widget/DualListCollection',
                'ossui/widget/CollectionDualListView',
                'ossui/widget/CheckboxTextView',
                'ossui/widget/DualListModel',
                'text!lib/amdocs/ossui/components/duallist/view/template/DualListView.html',
                'text!lib/amdocs/ossui/components/buttons/view/templates/OSSUIDefaultButtonTemplate.html',
                'ossui/widget/ModalDialogView', 'ossui/widget/ModalDialogCallback',
                'ossui/utils/OSSUIResourceBundle','ossui/utils/OSSUIUtils',
                'fixture.object', 'fixture.string', 'fixture.dom' ],
                /*jshint maxparams: 22 */
                /*jshint maxcomplexity: 12 */
                /*global alert */
        function(_, $, Lightsaber, Backbone, DualListCollection,
                CollectionDualListView, CheckboxTextView,DualListModel,
                DefaultDualListViewTemplate,
                ossuidefaultbuttontempl,ModalDialogView ,ModalDialogCallback,OSSUIResourceBundle,OSSUIUtils) {

            var DualListShellCollection = Lightsaber.Core.Collection
            .extend({

                model : DualListModel
            });

            
            var DualListView = Lightsaber.Core.View
                    .extend({
                        template : '',
                        config : {
                            toResetCollFirst : "n/a",
                            toResetCollSecond : "n/a",
                            toResetVMFirst : "n/a",
                            toResetVMSecond : "n/a",
                            firstListVM : "n/a",
                            secondListVM : "n/a",
                            useCaseModelURL : "n/a",
                            directDataMode : false,
                            collectionListItemViewType: CheckboxTextView,
                            showAddRemoveAll : false
                        },
                        initialize : function() {
                            /*jshint maxcomplexity:15 */
                            _.bindAll(this, 'saveData', 'cancelData' , 'listLoadedSuccessHandler', 'listLoadedErrorHandler', 
                                    'listSavedSuccessHandler', 'listSavedErrorHandler','setDirectData','getSaveData','onAddRemoveAll');
                            ModalDialogCallback.on('listLoadedSuccessHandler',this.listLoadedSuccessHandler);
                            ModalDialogCallback.on('listLoadedErrorHandler',this.listLoadedErrorHandler);
                            // url used by the [DualListCollection] (passed
                            // further down at construction time)
                            this.dualListModelURL = this.getConfig('useCaseModelURL') || this.config.useCaseModelURL; 

                            // template used by this JS file [dual list view]
                            this.template = this.getConfig('useCaseDualListViewTemplate') || DefaultDualListViewTemplate; 

                            // template used by the [COLLECTION dual list view
                            // JS] (passed further down at construction time)
                            this.useCaseCollectionDualListViewTemplate = this.getConfig('useCaseCollectionDualListViewTemplate');

                            // template used by the [collection list view JS]
                            // (called by CollectionDualListView) (passed
                            // further down at construction time)
                            this.useCaseCollectionListLabelTemplate = this.getConfig('useCaseCollectionListLabelTemplate');
                            
                            // template used by the [collection list view JS]
                            // (called by CollectionDualListView) (passed
                            // further down at construction time)
                            this.useCaseCollectionListTemplate = this.getConfig('useCaseCollectionListTemplate');

                            // template used by the [checkbox text view JS]
                            // (passed further down at construction time)
                            this.useCaseCollectionListItemTemplate = this.getConfig('useCaseCollectionListItemTemplate');
                            
                            this.collectionListItemViewType = this.getConfig('collectionListItemViewType');

                            
                            this.showAddRemoveAll = this.getConfig('showAddRemoveAll');
                            this.ifCreateButtons = this.getConfig('ifCreateButtons');

                            this.useCaseFirstListTitle = this.getConfig('useCaseFirstListTitle') ||  
                             OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.firstListTitle');
                            
                            this.useCaseSecondListTitle = this.getConfig('useCaseSecondListTitle') ||  
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.secondListTitle');
                            
                            this.maxSaveableNumber= this.getConfig('maxSaveableNumber') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.maxSaveableNumber');
                            
                            this.maxSaveableMessage= this.getConfig('maxSaveableMessage') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.duallist.maxSaveableMessage');
                            
                            this.maxSaveableWindowTitle= this.getConfig('maxSaveableWindowTitle') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.maxSaveableWindowTitle');
                            
                            this.maxSaveableWindowHeight= this.getConfig('maxSaveableWindowHeight') || 
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.maxSaveableWindowHeight');
                            
                            this.maxSaveableWindowButtonText= this.getConfig('maxSaveableWindowButtonText') ||
                            OSSUIResourceBundle.prototype.getMessage('ossui.labels.duallist.maxSaveableWindowButtonText');
                            
                            this.showSaveAlert = this.getConfig('showSaveAlert');
                            
                            //indicate if to get data directly without use REST
                            this.directDataMode = this.getConfig('directDataMode');
                            
                            // providing a timer for the case when the server stops responding in mid-action; default of 10 seconds
                            this.loadingScreenTimer = this.getConfig('loadingScreenTimer') || 10000;

                            // lookups for error messages will start off from areas designated as "baseKeyFor.."
                            this.baseKeyForStatusBasedMessages =  this.getConfig('baseKeyForStatusBasedMessages') || "ossui.errorMessages";
                            this.baseKeyForCodeBasedMessages =  this.getConfig('baseKeyForCodeBasedMessages') || "ann.search.ui.error.popup.servicefailure";
                            
                            this.viewModel.data.savedCollection = new DualListShellCollection({parentObject : this}); 
                            this.viewModel.data.originalCollection = new DualListShellCollection({parentObject : this});


                        },

                        _postRender : function() {
                            this.cleanSavedCollections();
                            this.createDualListViews();
                            if (this.directDataMode === false)
                            {
                                  this.showLoadingScreen();
                            }
                           
                        },

                        cleanSavedCollections: function() {
                            this.viewModel.data.savedCollection.reset();
                        }, 
                        /**
                         * gets the saved Dual List Collection ( i.e.  the left panel content after the "SAVE" action)
                         */
                        getSavedCollection : function() {
                            return this.viewModel.data.savedCollection;
                        },

                        /**
                         * gets the original Dual List Collection 
                         */
                        getOriginalCollection : function() {
                            return this.viewModel.data.originalCollection;
                        },

                        /**
                         * create Dual List Views
                         */
                        createDualListViews : function() {
                            this.createAttrListView();
                            if (this.ifCreateButtons === 'true') {
                                this.createButtons(this);
                            }
                        },
                        /**
                         * set the lists data directly without use REST, config need to set to directDataMode: true
                         */
                        setDirectData: function(rowsData) {
                            var firstList = this.subViews[0].viewInstance.firstListVM.models.items;
                            var secondList = this.subViews[0].viewInstance.secondListVM.models.items;
                            var options =  {reset: true, parse: true};
                            firstList.reset(rowsData,options);
                            firstList.successHandler(firstList,rowsData);
                            secondList.reset(rowsData,options);
                            firstList.trigger('sync', firstList, rowsData);
                            secondList.trigger('sync', secondList, rowsData);
                           // this.subViews[0].viewInstance.subViews[0].viewInstance.off('addRemoveAll',this.removeAll);
                           // this.subViews[0].viewInstance.subViews[0].viewInstance.on('addRemoveAll',this.removeAll);
                           // this.subViews[0].viewInstance.subViews[1].viewInstance.off('addRemoveAll',this.addAll);
                           // this.subViews[0].viewInstance.subViews[1].viewInstance.on('addRemoveAll',this.addAll);
                            //fix bug that the secend list is not getting scrollbars even if needed.
                            if (this.subViews[0].viewInstance.subViews[1])
                            {
                              this.subViews[0].viewInstance.subViews[1].viewInstance.scrollbar.delayedRefreshOfScrollbars();
                            }
                        },
                        
                        onAddRemoveAll: function(addRemoveIndicator){
                          var vm = null;
                          if (addRemoveIndicator === "remove")
                          {
                             vm = this.subViews[0].viewInstance.firstListVM;
                             this._addOrRemoveAll(vm, 1);
                          }
                          else{
                             vm = this.subViews[0].viewInstance.secondListVM;
                             this._addOrRemoveAll(vm,2);
                          }
                        },
                         
                         
                       _addOrRemoveAll: function(vm, status)
                       {
                          this.MaxNumberOfElementsExceeded = false;
                          var itemsModels =  _.clone(vm.models.items.models);
                          for (var i in itemsModels)
                          {
                             if (this.MaxNumberOfElementsExceeded)
                             {
                               break;
                             }
                             var item = itemsModels[i].attributes;
                             if(item.status == status)
                             {
                               var itemId =  item.id;
                               var params = ["updateModel",vm,itemId];
                               vm.handleAction.apply(vm, params);
                             }
                          }
                       },
                        
                        destroy: function() {
                            this._super();     
                            this.cleanSavedCollections();
                            this.viewModel.destroy();
                            this.viewModel.data.originalCollection.reset();
                            delete this.config.toResetCollFirst;
                            delete this.config.toResetCollSecond;
                             ModalDialogCallback.off('listLoadedSuccessHandler');
                             ModalDialogCallback.off('listLoadedErrorHandler');
                        },

                        /**
                         * create save & clear buttons
                         */
                        createButtons : function(localDualListView) {

                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // ~~~~~~~~ Buttons View Model ~~~~~~~~~~
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            var buttonModel = new Lightsaber.Core.Model();
                            var buttonViewModel = new Lightsaber.FormElementViewModel(
                                    {
                                        data : {
                                            labelSaveData : "Save",
                                            labelCancelData : "Cancel"
                                        },
                                        models : {
                                            myModel : buttonModel
                                        },

                                        config : {
                                            // view2reset : localDualListView,
                                            actions : {

                                                cancelData : this.cancelData,
                                                saveData : this.saveData

                                            }
                                        }

                                    });

                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // ~~~~~~~~~~~~~~ Buttons ~~~~~~~~~~~~~~~
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            var cancelButtonView = new Lightsaber.ButtonView({
                                viewModel : buttonViewModel,
                                config : {
                                    el : '#cancelbutton',
                                    template : ossuidefaultbuttontempl
                                },
                                vmKeys : {
                                    "data.text" : "labelCancelData",
                                    "action.click" : "cancelData"
                                }
                            });
                            
                            this.subViews.push({viewInstance:cancelButtonView});

                            var saveButtonView = new Lightsaber.ButtonView({
                                viewModel : buttonViewModel,
                                config : {
                                    el : '#savebutton',
                                    template : ossuidefaultbuttontempl
                                },
                                vmKeys : {
                                    "data.text" : "labelSaveData",
                                    "action.click" : "saveData"
                                }
                            });
                            
                            this.subViews.push({viewInstance: saveButtonView});

                        },

                        dualListModelURL : '',

                        useCaseCollectionDualListViewTemplate : '',
                        useCaseCollectionListLabelTemplate : '',
                        useCaseCollectionListTemplate : '',
                        useCaseCollectionListItemTemplate : '',

                       

                        /**
                         * create the basic and additional item list view to
                         * show attribute information.
                         */
                        createAttrListView : function() {

                            var objectID = ""; 

                            var objectClass = ""; 

                            // ~~~~~~~~~~~~~~~~~~~
                            // preparatory steps for the REST Data source load
                            var DLRESTDataSource = new Lightsaber.Core.LSRESTDataSource({ 
                                defaults:{
                                    contentType: 'application/json',
                                    fullURL:this.dualListModelURL
                                },
                                update: {
                                    method: 'PUT'      
                                },
                                read: {
                                    method: 'GET'
                                }
                            });
                            
                            
                            this.viewModel.data.savedCollection.setDataSource(DLRESTDataSource);

                            /*
                             * var originalAttributesModel = new
                             * DualListCollection( {url:this.dualListModelURL});
                             * originalAttributesModel.fetch();
                             */
                            // create model for basic attribute list
                            var basicAttributesModel = new DualListCollection({
                                parentData : this.viewModel.data,
                                parentObject : this
                            });
                            basicAttributesModel.setDataSource(DLRESTDataSource);

                            // create model for additional attribute jquery list
                            var additionalAttributesModel = new DualListCollection(
                                    {
                                        parentData : this.viewModel.data,
                                        parentObject : this
                                    });

                            additionalAttributesModel.setDataSource(DLRESTDataSource);
                            
                            var basicAttributeCollVM = this.createViewModel(
                                    "first", basicAttributesModel,
                                    additionalAttributesModel,
                                    this.useCaseFirstListTitle, true, 2, this);

                            basicAttributeCollVM.setConfig('filterFunction',
                                    function(model) {
                                        return model.attributes.status <= 1;
                                    });
                              if (this.directDataMode === false)
                              {
                                 basicAttributesModel.getAllAttributes(objectID,
                                    objectClass);
                              }

                            var additionalAttributeCollVM = this
                                    .createViewModel("second",
                                            additionalAttributesModel,
                                            basicAttributesModel,
                                            this.useCaseSecondListTitle, false,
                                            1, this);

                            additionalAttributeCollVM.setConfig(
                                    'filterFunction', function(model) {
                                        return model.attributes.status > 1;
                                    });

                            if (this.directDataMode === false)
                            {
                                additionalAttributesModel.getAllAttributes(
                                    objectID, objectClass);
                            }

                            var MyCheckboxTextView = this.collectionListItemViewType.extend({
                                        template : this.useCaseCollectionListItemTemplate
                                    });
                            
                            var MyCheckboxTextViewNoSort = this.collectionListItemViewType.extend({
                                        template : this.useCaseCollectionListItemTemplate,
                                        config : {
                                            draggableImageVisibility : "hide"
                                        }

                                    });

                            var newCollDL = new CollectionDualListView(
                                    {
                                        el : this
                                                .$("[data-uxf-point='dualAttrListView']"),
                                        viewModel : new Lightsaber.Core.ViewModel(),

                                        config : {
                                            useCaseCollectionDualListViewTemplate : this.useCaseCollectionDualListViewTemplate,
                                            useCaseCollectionListLabelTemplate : this.useCaseCollectionListLabelTemplate,
                                            useCaseCollectionListTemplate : this.useCaseCollectionListTemplate,
                                            firstListVM : basicAttributeCollVM,
                                            secondListVM : additionalAttributeCollVM,
                                            viewTypeFirst : MyCheckboxTextView, // CheckboxTextView,
                                            viewTypeSecond : MyCheckboxTextViewNoSort,
                                            showAddRemoveAll: this.showAddRemoveAll,
                                            addRemoveAllProxy: this.onAddRemoveAll
                                        // CheckboxTextView hide icon

                                        // TODO : wire up a different view here
                                        // (a non sortable one)
                                        }
                                    });
                            
                            this.subViews.push({viewInstance: newCollDL});
                            this.config.toResetCollFirst = basicAttributesModel;
                            this.config.toResetCollSecond = additionalAttributesModel;

                            return newCollDL;
                        },
                        
                        /**
                         * return the ViewModel
                         */
                        createViewModel : function(modelId, attributesModel,
                                attributesModeltoUpdate, displayLabel, state,
                                value, parentView) {
                            var newCollVM = new Lightsaber.CollectionViewModel({
                                models : {
                                    items : attributesModel
                                },
                                data : {
                                    label : displayLabel,
                                    parentView: parentView
                                },
                                config : {
                                    maxSaveable : this.maxSaveableNumber,
                                    maxSaveableMsg : this.maxSaveableMessage,
                                    modelId : modelId,
                                    initialState : state,
                                    actions : {
                                        updateModel : function() {
                                            var itemname = arguments[1];

                                            var model = _
                                                    .find(
                                                            this.models.items.models,
                                                            function(
                                                                    item) {
                                                                return item
                                                                        .get('name') === itemname;
                                                            });

                                            var othermodel = _
                                                    .find(
                                                            attributesModeltoUpdate.models,
                                                            function(
                                                                    item) {
                                                                return item
                                                                        .get('name') === itemname;
                                                            });


                                            var toBeSavedList = window.$("[data-uxf-point='firstCollectionListView'] [data-uxf-point='ossui-duallist-labelView-wrapper']");
                                            var numberToBeSaved = typeof(toBeSavedList) != 'undefined' ?toBeSavedList.length:0;
        

                                               if (this.config.attributes.modelId === 'second'
                                                  && (this.config.attributes.maxSaveable > 0 && 
                                                      numberToBeSaved >= this.config.attributes.maxSaveable)) {
                                                this.data.attributes.parentView
                                                        .handleMaxNumberOfElementsExceeded();
                                                // this following is a workaround for an issue whereby the state of the
                                                // checkbox had changed to "true" but the item had not been moved to the other panel;
                                                // so , we need to revert the status of the checkbox programmatically - w/o triggering an event
                                                var addableList = window.$("[data-uxf-point='secondCollectionListView'] [data-uxf-point='uxf-collection-item']");
                                                var modelIDThatCouldNotBeAdded = -1;
                                                var modelThatCouldNotBeAdded = '';
                                                for ( var k = 0; k < addableList.length; k++) {
                                                    modelIDThatCouldNotBeAdded = $(
                                                            addableList[k])
                                                            .find(
                                                                    "[data-uxf-point='ossui-duallist-id-hidden']")
                                                            .text();
                                                    if (''
                                                            + modelIDThatCouldNotBeAdded === ''
                                                            + model.attributes.id) {

                                                        modelThatCouldNotBeAdded = addableList[k];
                                                        break;
                                                    }
                                                }
                                                if ($
                                                        .isEmptyObject(modelThatCouldNotBeAdded) === false) {

                                                    $(
                                                            modelThatCouldNotBeAdded)
                                                            .find(
                                                                    "[data-uxf-point='myElement']")
                                                            .removeAttr(
                                                                    'checked');
                                                }
                                                // end of workaround ;
                                            } else {

                                                this.models.items
                                                        .remove(model);
                                                attributesModeltoUpdate
                                                        .remove(othermodel);
                                                model.attributes.status = value;
                                                attributesModeltoUpdate
                                                        .add(model);
                                            }
                                        }
                                    }
                                }
                            });
                            newCollVM.clean = function() {
                                if (this.currentModel) {
                                    this.currentModel.clean();
                                    this.currentModel.off();
                                    this.currentModel.reset();
                                }
                                delete this.parentData;
                                delete this.parentObj;
                                this.off();                 
                            };                            
                            return newCollVM;
                        },
                        
                        /**
                         * Default handling for the close of the warning message
                         */
                        _handleDialogClose : function(){
                            //this is the dialog's reference
                            $(this).dialog("close");                                                    
                        },
                        /**
                         * When Maximum no of elements  is exceeded a warning is shown to the user

                         *                             this.maxSaveableNumber= this.getConfig('maxSaveableNumber') || -1;
                            this.maxSaveableMessage= this.getConfig('maxSaveableMessage') || "Maximum Number of Saveable Items Exceeded: "+this.maxSaveableNumber;
                            this.maxSaveableWindowTitle= this.getConfig('maxSaveableWindowTitle') || "Warning";
                            this.maxSaveableWindowHeight= this.getConfig('maxSaveableWindowHeigh') || 220;

                         */
                        handleMaxNumberOfElementsExceeded : function(){
                            this.MaxNumberOfElementsExceeded = true;
                            var modalWarningWindow = new ModalDialogView({
                                viewModel :  new Lightsaber.Core.ViewModel(),
                                title : this.maxSaveableWindowTitle,
                                height : this.maxSaveableWindowHeight,
                                buttons :   [  {
                                    text : $('<div/>').html(this.maxSaveableWindowButtonText).text(),
                                    click : this._handleDialogClose
                                        
                                } ],
                                config  : {
                                dialogtemplate : '<span class="ossui-error-messageicon"></span><span>' + 
                                this.maxSaveableMessage+
                                '</span>' 
                                }
                                
                            });
                            this.subViews.push({viewInstance: modalWarningWindow});
                            modalWarningWindow.render();
                        },

                        showLoadingScreen : function() {
                            // check to see if the [div] had been rendered (yet)
                            if ($.isEmptyObject($('#dual_list_loading')) === false
                                    && $('#dual_list_loading').length > 0) {

                                $('#dual_list_loading').attr("style",
                                        "visibility:none");
                                $('#dual_list_loading').show();

                                var timeoutCallback = this.hideLoadingScreen;
                                var runtime = this.loadingScreenTimer; // in
                                // milliseconds
                                setTimeout(function() {
                                    // these lines will be called after 'runtime' interval;
                                    // making the spinner hide by either the timer or the callback (whichever
                                    // happens first)
                                    timeoutCallback();
                                }, runtime);
                            }// end "if div rendered"
                        }, 

                        hideLoadingScreen : function() {
                            $('#dual_list_loading').hide();
                            $('#dual_list_loading').hide();
                        }, 
                        //  ~~~ list loaded callbacks ~~~~~
                        listLoadedSuccessHandler : function() {
                            this.hideLoadingScreen();
                            this.listLoadedSuccessCallback();
                        },
                        
                        listLoadedSuccessCallback: function(){
                            //console.log(" overide the [listLoadedSuccessCallback] in order to implement your own callback ");
                        },
                        
                        listLoadedErrorHandler : function(serviceResponse) {
                            this.hideLoadingScreen();
                            this.listLoadedErrorCallback(serviceResponse);
                        }, 
                        listLoadedErrorCallback : function(serviceResponse) {
                            //console.log(" overide the [listLoadedErrorCallback] in order to implement your own callback ");
                            var windowTitle = OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.errorString');
                            var buttonText =  OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
//                            var localisedMessage = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.errorCode');
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,this.baseKeyForStatusBasedMessages, baseKeyForCodeBasedMessages 
                            OSSUIUtils.launchErrorWindow(serviceResponse,windowTitle, buttonText,220,null,
                                    this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                        },
                        //  ~~~ list saved callbacks ~~~~~
                        listSavedSuccessHandler : function() {
                            this.hideLoadingScreen();
                            this.listSavedSuccessCallback();
                        },
                        listSavedErrorHandler : function() {
                            this.hideLoadingScreen();
                            this.listSavedErrorCallback();
                        },
                        listSavedSuccessCallback : function() {
                            //console.log(" overide the [listSavedSuccessCallback] in order to implement your own callback ");
                        },
                        listSavedErrorCallback : function(serviceResponse) {
                            //console.log(" overide the [listSavedSuccessCallback] in order to implement your own callback ");
                            var windowTitle = OSSUIResourceBundle.prototype.getMessage('ossui.labels.heading.errorString');
                            var buttonText =  OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.okString');
                            //var localisedMessage = OSSUIResourceBundle.prototype.getMessage('ossui.errorMessages.restservice.failedSave');
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedMessages , baseKeyForCodeBasedMessages
                            OSSUIUtils.launchErrorWindow(serviceResponse,windowTitle, buttonText,220,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                            
                        },
                        handleGlobalError : function(response) {
                            // signature looks like this :
                            // function(response, windowTitle,
                            //        windowButtonText, windowHeight, localisedMessage,baseKeyForStatusBasedMessages , baseKeyForCodeBasedMessages
                            OSSUIUtils.launchErrorWindow(response, null, null, 212,null,this.baseKeyForStatusBasedMessages , this.baseKeyForCodeBasedMessages);
                        },
                        
                        cancelData : function() {
                            // getAllAttributes will trigger a "show Loading Screen" action (hourglass)
                            //this.config.toResetCollFirst.getAllAttributes();
                            //this.config.toResetCollSecond.getAllAttributes();
                        },
                         getSaveData :  function() { 
                         // saving the first subset - aka the LEFT panel
                            // entries ONLY
                            var selectedElements = this.$("[data-uxf-point='firstCollectionListView'] [data-uxf-point='ossui-duallist-labelView-wrapper']");

                            if (selectedElements.length > 0) {

                                // empty the previously saved collection
                                this.viewModel.data.savedCollection.reset();
                                
                                for ( var j = 0; j < selectedElements.length; j++) {
                                    // saving the "ID" for the REST update
                                    // operation(s)
                                    var modelIDToBeSaved = this.$(selectedElements[j]).find("[data-uxf-point='ossui-duallist-id-hidden']").text();

                                    if (modelIDToBeSaved) {
                                        for ( var k = 0; k < this.config.toResetCollFirst.models.length; k++) {
                                            var originalModelID = this.config.toResetCollFirst.models[k].attributes.id;

                                            // trying to match the HTML model-id
                                            // with the Id present in the model
                                            // (list)
                                            // and then trying to set a new status
                                            if (originalModelID.toString() ===  modelIDToBeSaved.toString()) {
                                                this.config.toResetCollFirst.models[k].attributes.status = "1";// meaning
                                                                                                                // that
                                                                                                                // when
                                                                                                                // next
                                                                                                                // fetched
                                                                                                                // back
                                                                                                                // , it
                                                                                                                // should
                                                                                                                // be
                                                                                                                // on
                                                                                                                // the
                                                                                                                // left
                                                                                                                // panel

                                                // exposing the saved model(s) to an external app.
                                                this.viewModel.data.savedCollection.add(this.config.toResetCollFirst.models[k]);                                               
                                                break;
                                            }
                                        }
                                    }

                                }

                            }
                            return this.viewModel.data.savedCollection;
                        },
                        /* jshint maxcomplexity: 12 */
                        saveData : function() {                            
                            
                            this.getSaveData();
//                            console.log(" REST Data source  LIST UPDATE:");
                            this.showLoadingScreen();
                            // the following syntax is required because there is no LS implementation 
                            // for a direct Lightsaber list update.

                            try {// catching network errors and the like
                                var restDS = this.viewModel.data.savedCollection
                                        .getDataSource();
                                restDS
                                        .sync(
                                                'update',
                                                this.viewModel.data.savedCollection,
                                                {
                                                    method : 'PUT',
                                                    contentType : 'application/json',
                                                    success : this.listSavedSuccessHandler,
                                                    error : this.listSavedErrorHandler
                                                });
                            }

                            catch (error) {
                                this.handleGlobalError(error);

                            }
                            // Note : an alternative way of updating a list is through Backbone - but it lacks a secure transport 
                            // Backbone.sync('update', this.viewModel.data.savedCollection, {url: this.dualListModelURL});
                            if (this.showSaveAlert == 'true') {
                                alert(msg);
                            }

                        }
                    });
            return DualListView;
        });
