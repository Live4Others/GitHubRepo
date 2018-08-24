define(
        'ossui/widget/CollectionDualListView',
        [
                'underscore',
                'jquery',
                'jquery.ui',
                'lightsaber',
                'ossui/widget/CollectionListView',
                'text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionDualListView.html',
                'text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionListLabel.html'
                 ],
        function(_, $, ui, Lightsaber, CollectionListView,
                DefaultCollectionDualListViewTemplate, DefaultCollectionListLabelTemplate) {
            

            /**
             * This view is used to create dual collection list. It expect the
             * below parameters el : element, viewModel : viewModel,
             * config.firstListVM : viewModel for first side collection view,
             * config.secondListVM : viewModel for second side collection view,
             * config.viewType : view type for items attached inside.
             * 
             */
            var CollectionDualListView = Lightsaber.Core.View
                    .extend({

                        initialize : function() {
                            if (arguments[0].config.useCaseCollectionDualListViewTemplate && arguments[0].config.useCaseCollectionDualListViewTemplate !== '') {
                                this.template = arguments[0].config.useCaseCollectionDualListViewTemplate;
                            } else {
                                this.template = DefaultCollectionDualListViewTemplate;
                            }
                            if (arguments[0].config.useCaseCollectionListLabelTemplate && arguments[0].config.useCaseCollectionListLabelTemplate !== '') {
                                this.options.config.labelTemplate = arguments[0].config.useCaseCollectionListLabelTemplate;
                            } else {
                                this.options.config.labelTemplate = DefaultCollectionListLabelTemplate;
                            }

                            if ($.isEmptyObject(arguments[0].config.useCaseCollectionListTemplate) === false) {
                                this.options.config.collectionListTemplate = arguments[0].config.useCaseCollectionListTemplate;
                            } 

                            Lightsaber.Core.View.prototype.initialize.call(this, arguments);
                        },

                        _postRender : function() {

                            this.firstListVM = this.getConfig('firstListVM');
                            this.secondListVM = this.getConfig('secondListVM');
                            var configTemplate  = this.options.config.labelTemplate;
                            var configCollectionListTemplate  = this.options.config.collectionListTemplate;
                            var viewTypeClassFirst = this.getConfig('viewTypeFirst');
                            var viewTypeClassSecond = this.getConfig('viewTypeSecond');

                            var firstListCollectionEl = this.$("[data-uxf-point='firstCollectionListView']");
                            var secondListCollectionEl = this.$("[data-uxf-point='secondCollectionListView']");
                            var showAddRemoveAll = this.getConfig('showAddRemoveAll');
                            var addRemoveAllProxy = this.getConfig('addRemoveAllProxy');

                            // create first collection view list                            
                            this.firstListVM.on('items:loaded',
                                function() {
                                    // Create first collection list view
                                    this.createList(this.firstListVM, firstListCollectionEl,
                                        {
                                            labelTemplate : configTemplate,
                                            useCaseCollectionListTemplate: configCollectionListTemplate,
                                            viewType : viewTypeClassFirst,
                                            sortable : true,
                                            viewId : "firstView",
                                            addRemveButtonTitle: "Remove All",
                                            showAddRemoveAll: showAddRemoveAll,
                                            addRemoveAllProxy:addRemoveAllProxy, 
                                            addRemveOpration:"remove"
                                            
                                        });                                                                          
                                }, this);
                            //create second collection view list
                            this.secondListVM.on('items:loaded',
                                function() {
                                    //Create right collection list view
                                    this.createList(this.secondListVM, secondListCollectionEl,
                                        {
                                            labelTemplate : configTemplate,
                                            useCaseCollectionListTemplate: configCollectionListTemplate,
                                            viewType : viewTypeClassSecond,
                                            sortable : false,
                                            viewId : "secondView",
                                            addRemveButtonTitle:"Add All",
                                            showAddRemoveAll: showAddRemoveAll,
                                             addRemoveAllProxy:addRemoveAllProxy, 
                                            addRemveOpration:"add"
                                        });                                                                          
                                }, this);  
                                                                 
                        },
                        
                        createList: function(viewModel, el, config) {
                            var collectionListView = new CollectionListView({
                                el: el,
                                viewModel: viewModel,
                                config: config
                            });
                            this.subViews.push({viewInstance: collectionListView});
                            return collectionListView;
                        },
                        
                        destroy: function() {
                            this._super();
                            this.addRemoveAllProxy = null;
                            this.subViews.length = 0;
                            this.firstListVM.destroy();                            
                            this.secondListVM.destroy();
                        }
                        
                    });

            return CollectionDualListView;

        });
	