define(
        'ossui/widget/CheckboxTextView',
        [ 'underscore', 'lightsaber', 'jquery.ui',
          'text!lib/amdocs/ossui/components/duallist/collectionviews/template/CollectionListItem.html'
                 ],
        function(_, Lightsaber, jqUI, DefaultCollectionListItemTemplate
                ) {

            var CheckboxTextView = Lightsaber.Core.View
                    .extend({

                        vmKeys : {
                            'action.click' : 'updateModel'
                        },

                        initialize : function() {
                            // this._super();
                            this._initialize();

                            if ($.isEmptyObject(this.template) === true) {
                                // default template
                                this.template = DefaultCollectionListItemTemplate;
                            }
                        },


                        _initialize : function(option) {                            
                        },

                        _postRender : function() {                        
                            if ($.isEmptyObject(this.viewModel.models.model) === false) {
                                this._createContent();
                            }
                        },
                        
                        destroy: function() {
                            for (var key in this.subViews) {
                                this.subViews[key].viewInstance.viewModel.off();
                                this.subViews[key].viewInstance.viewModel.destroy();
                            }
                            this._super(true);
                            this.viewModel.destroy();
                        },

                        _createContent : function() {
                            var checkboxViewBtn = new Lightsaber.CheckboxView(
                                    {
                                        viewModel : new Lightsaber.Core.ViewModel(
                                                {
                                                    models : {
                                                        myModel : new Lightsaber.Core.Model()
                                                    },
                                                    data : {
                                                        text : '',
                                                        label : ' ',
                                                        value : this.viewModel.models.model.attributes.value
                                                    },
                                                    dataBindings : [ {
                                                        'fieldValue' : 'models.myModel.state',
                                                        options : {
                                                            setOnBind : true,
                                                            twoWay : true
                                                        }
                                                    } ]

                                                }),
                                        config : {
                                            inputAttributes : {
                                                checked : this.viewModel.parentVM.getConfig('initialState')
                                            }
                                        },
                                        vmKeys : this.vmKeys
                                    });
                            this.subViews.push({viewInstance: checkboxViewBtn});

                            checkboxViewBtn.bind("changed:value",
                                            function(data) {
                                                this.viewModel.handleAction(this.vmKeys['action.click'],
                                                                this.viewModel.models.model.attributes.name);
                                            }, this);

                            this.$("[data-uxf-point='ossui-duallist-id-hidden']")
                                  .append(this.viewModel.models.model.attributes.id);
                            
                            this.$("[data-uxf-point='ossui-duallist-labelView']")
                                    .append(this.viewModel.models.model.attributes.displayValue);
                            this.$("[data-uxf-point='ossui-duallist-buttonView']")
                                    .append(checkboxViewBtn.$el);

                            var currentImage = this.$root
                                    .find("[class='ossui-duallist-draggable'] img");
                            if ($.isEmptyObject(currentImage) ===  false)
                            {
                                if(this.config.draggableImageVisibility === "hide")
                                    {
                                        this.$("[class='ossui-duallist-draggable'] img").hide(); 
                                    }
                                else
                                    {
                                        this.$("[class='ossui-duallist-draggable'] img").show(); 
                                    }
                                
                            }
                        }
                    });

            return CheckboxTextView;
        });
