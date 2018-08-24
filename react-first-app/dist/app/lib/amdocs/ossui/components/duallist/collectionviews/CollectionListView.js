define(
        'ossui/widget/CollectionListView',
        [
                'underscore',
                'jquery',
                'lightsaber',
                'text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionList.html',
                 'text!lib/amdocs/ossui/components/buttons/view/templates/OSSUIDefaultButtonTemplate.html',
                'ossui/widget/SortableCollectionView',
                'ossui/widget/ScrollbarWidget'],
        function(_, $, Lightsaber, DefaultCollectionListTemplate,ossuidefaultbuttontempl,
                 SortableCollectionView, OssuiScrollbar) {

             var CollectionListView = Lightsaber.Core.View
                    .extend({

                        //template : DefaultCollectionListTemplate,

                        emptyCurrentSection : function() {
                            this.$el.off();
                            this.$el.empty();
                        },

                         initialize : function() {
                            _.bindAll(this, 'onAddRemoveAll');
                            if (this.options.config.useCaseCollectionListTemplate && this.options.config.useCaseCollectionListTemplate !== '') {
                                this.template = this.options.config.useCaseCollectionListTemplate;
                            } else {
                                // default template
                                this.template = DefaultCollectionListTemplate;
                            }
                            
                            this.emptyCurrentSection();

                            Lightsaber.Core.View.prototype.initialize.call(
                                    this, arguments);

                        },

                        _postRender : function() {
                            this._createView();
                        },
                        
                        onAddRemoveAll : function() {
                           this.trigger('addRemoveAll', this.getConfig('addRemveOpration'));
                        },
                        
                        addButtons :  function(view) {
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            // ~~~~~~~~ Buttons View Model ~~~~~~~~~~
                            // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            var buttonModel = new Lightsaber.Core.Model();
                            var buttonViewModel = new Lightsaber.FormElementViewModel(
                                    {
                                        data : {
                                            labelAddAllData : this.options.config.addRemveButtonTitle
                                        },
                                        models : {
                                            myModel : buttonModel
                                        },

                                        config : {
                                            actions : {

                                                addRemoveAllData: this.onAddRemoveAll

                                            }
                                        }

                                    });
                                    
                                     var addAllButtonView = new Lightsaber.ButtonView({
                                viewModel : buttonViewModel,
                                config : {
                                    el : '#addRemoveAllbutton',
                                    template : ossuidefaultbuttontempl
                                },
                                vmKeys : {
                                    "data.text" : "labelAddAllData",
                                    "action.click" : "addRemoveAllData"
                                }
                            });
                            
                            view.subViews.push({viewInstance: addAllButtonView});
                        },

                        _createView : function() {

                            var labelViewModel = new Lightsaber.Core.ViewModel(
                                    {
                                        data : {
                                            label : this.viewModel.data.attributes.label
                                        }
                                    });

                            var LabelView = Lightsaber.Core.View.extend({
                                template : this.getConfig('labelTemplate')

                            });

                            var view = new LabelView({

                                viewModel : labelViewModel,
                                el : this.$("[data-uxf-point='ListLabel']"),
                                vmKeys : {
                                    "data.label" : "label"
                                }
                            });
                            if (this.getConfig('showAddRemoveAll'))
                            {
                               this.addButtons(view);
                               this.on('addRemoveAll',this.getConfig('addRemoveAllProxy')); 
                            }
                            
                            this.subViews.push({viewInstance: view});

                            var viewTypeClass = this.getConfig('viewType');
                            var sortable = this.getConfig('sortable') && true;
                            var listElement = this.$("[data-uxf-point='List']");
                            this._createCollectionView(listElement, this.viewModel, viewTypeClass, sortable);
                            var scrollPane = this.$("[data-uxf-point='ossui-content']");
                            var viewPort = this.$("[data-uxf-point='List']");
                            this.scrollbar = new OssuiScrollbar({scrollbarScrollPane:scrollPane, scrollbarViewPort : viewPort,
                                scrollbarType : 'ossui-custom-scrollbar', scrollbarWidth : '6px'});
                        },

                        _createCollectionView : function(element,
                                collectionViewModel, viewTypeClass, sortable) {

                            var collView = new SortableCollectionView(
                                    {
                                        el : element,
                                        viewModel : collectionViewModel,
                                        config : {
                                            sortable : sortable
                                        },
                                        viewConfig : {
                                            template : '<div data-uxf-point="ossui-content"></div>',
                                            viewType : viewTypeClass,
                                            viewEl : 'div[data-uxf-point="ossui-content"]'
                                        },
                                        sortConfig : {
                                            handle : ".ossui-duallist-draggable",
                                            cursor : "move"
                                        }
                                    });
                            this.subViews.push({viewInstance: collView});
                        },
                        
                        destroy: function() {
                            this.off('addRemoveAll',this.getConfig('addRemoveAllProxy')); 
                            this.scrollbar.removeScrollbar();
                            delete this.scrollbar;
                            this._super(true);                            
                        }
                    });

            return CollectionListView;
        });

