/**
 * @class CollectionView
 * @augments TBD
 * @custLevel OSSUI
 * @type Lightsaber.Core.View
 * @memberOf Ossui
 * @name CollectionView
 * @property TBD
 * @version TBD
 *
 * @description TODO:
 *
 *
 * @example TODO:
 *
 * <code>
 * </code>
 *
 */
define('ossui/widget/CollectionView',
        [ 'jquery', 'underscore', 'lightsaber' ],
        function($, _, LS) {
            var collView = LS.Core.View.extend({
                        
                        /**
                         * 
                         * @param options
                         */
                        initialize : function(options) {
                            _.bindAll(this, '_added', '_removed', '_changed',
                                    '_subViewsRefresh', '_cleared',
                                    '_handlePage');
                            // binding to the viewmodel events
                            this.viewModel.on('items:loaded', this._subViewsRefresh);
                            this.viewModel.on('items:emptied', this._cleared);
                            this.viewModel.on('items:refreshed', this._subViewsRefresh);
                            this.viewModel.on('items:added', this._added);
                            this.viewModel.on('items:changed', this._changed);
                            this.viewModel.on('items:removed', this._removed);
                            this.viewModel.on('items:paginated', this._handlePage);
                        },
                        
                        /**
                         * TODO:
                         */
                        _handleSubViews : function() {
                            // create sub views based on collection view model
                            this._prepareSubViews();
                            this._super();
                        },

                        /**
                         * 
                         * @returns TODO:
                         */
                        _getCollectionViewData : function() {
                            var collection = this.viewModel.currentModel;
                            var sortFunction = this.viewModel._getSortFunction();
                            var filterFunction = this.viewModel.getConfig('filterFunction');

                            var pageNum = this.getConfig('pageNum');
                            var pageModels = collection.getPage(pageNum);

                            pageModels.data = _.isFunction(filterFunction) ? _.filter(pageModels.data, filterFunction)
                                    : pageModels.data;
                            pageModels.data = _.isFunction(sortFunction) ? _.sortBy(pageModels.data, sortFunction)
                                    : pageModels.data;

                            return pageModels.data;

                        },

                        /**
                         * TODO:
                         */
                        _prepareSubViews : function() {
                            var collection = this._getCollectionViewData();

                            this.subViews = [];
                            this.sortedViewList = [];

                            var noOfRecords = collection.length;
                            for (var count = 0; count < noOfRecords; ++count) {
                                var model = collection[count];
                                var viewModel = this._createViewModel(model, count);
                                var instanceDetails = this._createView(viewModel);
                                var view = instanceDetails.viewInstance;
                                this.subViews.push(instanceDetails);
                                this.sortedViewList.push(view);
                            }
                        },

                        /**
                         * 
                         * @param model
                         * @param i
                         * @returns {___viewModel0}
                         */
                        _createViewModel : function(model, i) {
                            var modelObj = model.toJSON();
                            var binding = [];
                            
                            for (var attr in modelObj) {
                                if (modelObj.hasOwnProperty(attr)) {
                                    var bindingObj = {};
                                    var modelAttr = 'models.model.' + attr;
                                    bindingObj[attr] = modelAttr;
                                    bindingObj.options = {
                                        setOnBind : true,
                                        twoWay : true
                                    };
                                    binding.push(bindingObj);    
                                }
                            }

                            var actions = {};
                            var parentActions = this.viewModel.getConfig('actions');
                            
                            for (var action in parentActions) {
                                if (parentActions.hasOwnProperty(action)) {
                                    /* 
                                     * Dont want to change this implementation to allow the easy merging 
                                     * when Lightsaber comes with their own CollectionView class.
                                     */
                                    
                                    /*jshint loopfunc: true */
                                    actions[action] = function() {
                                        var params = [].slice.call(arguments);
                                        params.splice(0, 0, action, this);
                                        // params.push(this.parentVMIndex);
                                        this.parentVM.handleAction.apply(this.parentVM, params);
                                    };
                                    /*jshint loopfunc: false */
                                }
                            }

                            var viewModel = new LS.Core.ViewModel({
                                models : {
                                    model : model
                                },
                                dataBindings : binding,
                                config : {
                                    actions : actions
                                }
                            });

                            viewModel.parentVM = this.viewModel;
                            viewModel.parentVMIndex = i;
                            
                            return viewModel;
                        },

                        /**
                         * 
                         * @param viewModel
                         * @returns {___anonymous6901_6991}
                         */
                        _createView : function(viewModel) {
                            var ViewType = this.getConfig('viewType') || LS.Core.View;

                            var viewOptions = this.getConfig('viewOptions') || {};
                            viewOptions = _.defaults({}, viewOptions, {
                                viewModel : viewModel
                            });
                            
                            var el;
                            if (viewOptions.el) {
                                // we don't allow setting el for each view
                                el = viewOptions.el;
                                delete viewOptions.el;
                            } else {
                                el = this.getConfig('viewEl');
                            }
                            
                            var viewInstance = new ViewType(viewOptions);
                            viewInstance.$root.attr('data-uxf-point', 'uxf-collection-item');

                            var instanceDetails = {
                                viewInstance : viewInstance
                            };
                            
                            if (el) {
                                instanceDetails.el = el;
                            }
                            
                            return instanceDetails;
                        },

                        /**
                         * TODO:
                         */
                        _changed : function() {},

                        /**
                         * TODO:
                         */
                        _cleared : function() {
                            // would like to use this._refresh(); but that
                            // doesn't cover the all render cycle
                            this._destroySubViews();
                        },

                        /**
                         * TODO:
                         */
                        _subViewsRefresh : function() {
                            this._destroySubViews();
                            this._handleSubViews(); // view render method
                        },

                        /**
                         * TODO:
                         */
                        _handlePage : function() {
                            this._subViewsRefresh();
                        },

                        /**
                         * 
                         * @param data
                         */
                        _added : function(data) {
                            var sortedIndex = _.isUndefined(data.sortedIndex) ? this.viewModel.currentModel.models.length - 1
                                    : data.sortedIndex;
                            var model = this.viewModel.currentModel.models[sortedIndex];
                            var viewModel = this._createViewModel(model, sortedIndex);
                            var viewDetails = this._createView(viewModel);
                            var view = viewDetails.viewInstance;
                            // add to subview
                            this.addSubView(viewDetails);

                            // fix indexes
                            for ( var i = sortedIndex; i < this.sortedViewList.length; ++i) {
                                this.sortedViewList[sortedIndex].viewModel.parentVMIndex += 1;
                            }
                            // add to sorted view list
                            this.sortedViewList.splice(sortedIndex, 0, view);

                            // move to proper location if needed
                            if (sortedIndex < this.sortedViewList.length - 1) {
                                this.sortedViewList[sortedIndex + 1].before(this.sortedViewList[sortedIndex]);
                            }
                        },

                        /**
                         * 
                         * @param data
                         */
                        _removed : function(data) {
                            var sortedIndex = data.sortedIndex || -1;
                            if (sortedIndex < 0) {
                                for ( var i = 0; i < this.sortedViewList.length; ++i) {
                                    var model = this.sortedViewList[i].viewModel.models.model;
                                    if (model.cid == data.modelData.cid) {
                                        sortedIndex = i;
                                        break;
                                    }
                                }
                            }
                            
                            if (sortedIndex >= 0 && sortedIndex < this.sortedViewList.length) {
                                var viewToRemove = this.sortedViewList[sortedIndex];
                                viewToRemove.destroy();
                                // remove from the sorted list
                                this.sortedViewList.splice(sortedIndex, 1);
                                // fix indexes
                                for ( var count = sortedIndex; count < this.sortedViewList.length; ++count) {
                                    this.sortedViewList[sortedIndex].viewModel.parentVMIndex -= 1;
                                }
                            }
                        },

                        /**
                         * TODO:
                         */
                        _destroySubViews : function() {
                            
                            for (var cid in this._subViews) {
                                if (this._subViews.hasOwnProperty(cid) && this._subViews[cid].instance){
                                    this._subViews[cid].instance.destroy();
                                }
                            }
                            
                            this._subViews = {};
                            this.subViews = [];
                            this.sortedViewList = [];
                        }

                    });
            return collView;
        });
