define('ossui/widget/DualListCollection',
        [ 'underscore', 'jquery', 'jquery.ui', 'lightsaber','backbone',
        'ossui/widget/DualListModel' ,     'ossui/widget/ModalDialogCallback',
        'ossui/utils/OSSUIBasicUtils'],
        function(
        _, $, ui, Lightsaber, Backbone, DualListModel , ModalDialogCallback, OSSUIBasicUtils) {

    var DualListCollection = Lightsaber.Core.Collection
            .extend({

                model : DualListModel,

                options : {
                    error : this.errorHandler,
                    success : this.successHandler
                },
                data : {
                },
                initialize : function(request) {
                    // do not need the URL as we are using the Lightsaber REST Data Source (which has the the url  in it) 
                    //  this.url = request.url;
                      
                    this.parentData = ($.isEmptyObject(request.parentData) === false)?request.parentData:"n/a";
                    this.parentObject = ($.isEmptyObject(request.parentObject) === false)?request.parentObject:"";
                    this.data.errorEventNumber = 0;

                    // fix: pass method names to 'bindAll', otherwise the 'model' property will be trashed.
                    _.bindAll(this, 'successHandler', 'errorHandler', 'parse', 'fetch', 'getAllAttributes');

                    //                            console
                    //                                    .log('DLElements Collection init');
                    Lightsaber.Core.Collection.prototype.initialize.call(this);
                },

                // This is the function that gets called
                // on a successful load.
                successHandler : function(data, response) {
                    // this.reset(this.model);
                    // preserve the original collection in the "data" area of the calling VM
                    if (typeof (this.parentData.originalCollection) != 'undefined') {
                        if (this.parentData.originalCollection.length <= 0) {
                            for ( var i = 0; i < data.models.length; i++) {
                                this.parentData.originalCollection
                                        .add(new Backbone.Model(
                                                data.models[i].toJSON()));
                            }
                        }
                    }

                    // sling back another event to the calling View
                    ModalDialogCallback.trigger('listLoadedSuccessHandler',this);
                },

                errorHandler : function(data, response) {
                    //console.trace();
                    
                    // multiple Backbone event bindings happen here ; ignoring all bar the first one,
                    if (this.data.errorEventNumber  <= 0 )
                        {
                            ModalDialogCallback.trigger('listLoadedErrorHandler',response);
                            this.data.errorEventNumber = this.data.errorEventNumber + 1;
//                            console.log("DualList Collection  INNER :Error # :" +this.data.errorEventNumber);
                            
                        }
                    // preventing repetitive events
                    if (!$.isEmptyObject(this.parentObject)) {
                        this.parentObject.undelegateEvents();
                    }
                    this.unbind();

                     // preventing remnant loadingScreen
                    if (!$.isEmptyObject(this.parentObject)) 
                    {
                     this.parentObject.hideLoadingScreen();
                    }
                     return false;
                },

                parse : function(response) {
                            // console.log('DualList Collection PARSE called ');

                    // html decode the response, e.g., "town&#x2F;city" to "town/city"
                    if (_.isArray(response)) {
                        _.each(response, function(responseObj) {

                            responseObj.id = OSSUIBasicUtils.htmlUnescape(responseObj.id);
                            responseObj.name = OSSUIBasicUtils.htmlUnescape(responseObj.name);
                            responseObj.displayValue = OSSUIBasicUtils.htmlUnescape(responseObj.displayValue);
                        });
                    }
                    return response;

                },

                fetch : function(objectId, objectClass) {
                    //                            console
                    //                                    .log('DualList Collection FETCH called ');
                    /* implement a specific query  if needed
                     * data = key="id" value = "id001 " ????
                    this.options.data = QueryParamsUtil
                            .makeQueryString({
                                objectID : objectId,
                                objectClass : objectClass,
                                display : 'more'
                            });
                     */
                    this.options.success = this.successHandler;
                    Lightsaber.Core.Collection.prototype.fetch.call(this,
                            this.options);
                },

                getAllAttributes : function(objectId, objectClass) {
                    if (!$.isEmptyObject(this.parentObject)) {
                        this.parentObject.showLoadingScreen();
                    }
                    try {
                        this.fetch(objectId, objectClass);
                    } catch (error) {
                        if (!$.isEmptyObject(this.parentObject)) {
                            this.parentObject.handleGlobalError(error);
                        }
                    }
                },
                
                clean: function() {                    
                    delete this.parentObject;
                    delete this.parentData;
                    delete this.data;
                }
            });
    return DualListCollection;
});
