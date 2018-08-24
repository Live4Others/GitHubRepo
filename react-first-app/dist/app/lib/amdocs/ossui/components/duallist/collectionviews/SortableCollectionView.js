define(
        'ossui/widget/SortableCollectionView',
        [ 'underscore', 'lightsaber', 'jquery.ui',
          'ossui/widget/CollectionView'
          ],
        function(_, Lightsaber, jqUI, OSSUICollectionView) {

            var SortableCollectionView = Lightsaber.Core.View
                    .extend({

                        sortable : true,

                        vmKeys : {
                            "action.postSort" : "postSort"
                        },

                        initialize : function() {
                            this._initialize();
                        },

                        _initialize : function(option) {                            
                            var self = this;
                            this.sortable = this.getConfig('sortable')
                                    && this.sortable;
                            this.options.sortConfig.stop = function(event, ui) {
                                self.viewModel.handleAction(
                                        self.vmKeys['action.postSort'], event,
                                        ui);
                            };
                        },
                        
                        destroy: function() {
                            this.viewModel.destroy();
                            this._super();                    
                        },

                        _postRender : function() {
                            this._createSortableCollectionView();
                        },

                        _createSortableCollectionView : function() {
                            var collView = new OSSUICollectionView({
                                el : this.$el,
                                viewModel : this.viewModel,
                                config : this.options.viewConfig
                            });
                            if (this.sortable) {
                                this.$(this.options.viewConfig.viewEl)
                                        .sortable(this.options.sortConfig);
                            }
                            
                            this.subViews.push({viewInstance: collView});
                        }

                    });

            return SortableCollectionView;
        });

