var amdocs = amdocs || {};
amdocs.utils = amdocs.utils || {};
amdocs.utils.polyfill = {
    createArray : function (arrValue) {
        var arr = arrValue;
        if (angular.isUndefined(arrValue) || !angular.isArray(arrValue)) {
            arr = [];
        }
        if (!angular.isFunction(arr.indexOf)) {
            arr.indexOf = function (item, fromIndex) {
                var len = this.length || 0;
                if (len <= 0) {
                    return -1;
                }
                fromIndex = fromIndex || 0;
                fromIndex = (fromIndex < 0) ? Math.ceil(fromIndex) : Math.floor(fromIndex);
                if (fromIndex >= len) {
                    return -1;
                }
                if (fromIndex < 0) {
                    fromIndex += len;
                }
                while (fromIndex <  len) {
                    if (fromIndex in this && this[fromIndex] === item) {
                        return fromIndex;
                    }
                    fromIndex++;
                }
                return -1;
            };
        }
        return arr;
    }
};
amdocs.utils.isScope = function (obj) {
    return obj && obj.$evalAsync && obj.$watch;
};
amdocs.providers = {
    uxfHub : function (expPackage) {
        var _amdocsExpPackageHub = null;
        var _waitingForSubscribe = [];
        var _constructor = function () {
            require([ expPackage ],
                function (amdocsExpPackage) {
                    _amdocsExpPackageHub = amdocsExpPackage.hub;
                    angular.forEach(_waitingForSubscribe, function (obj) {
                        _amdocsExpPackageHub.subscribe(obj.name, obj.options);
                    });
                });
        };
        _constructor();
        /**
         * Indicate if the _amdocsExpPackageHub was loaded and ready to use.
         *  @private
         *  @method _hasExpPackageLoaded
         */
        this._hasExpPackageLoaded = function () {
            return angular.isObject(_amdocsExpPackageHub);
        };
        /**
         * Subscribe a *Service* to a *Topic* via *BusinessWidgetHub*.
         *
         *  @method subscribeTopic
         *  @param {String} topicName *Topic* name
         *  @param {Object} [options] *Topic* configuration object
         *  @param {Object} [options.vmKeys] vmKeys object
         *  @param {String} [options.vmId] view model require path
         *  @param {String} [options.mode] *Topic* mode
         */
        this.subscribeTopic = function (topicName, topicListenersOptions) {
            if (this._hasExpPackageLoaded()) {
                _amdocsExpPackageHub.subscribe(topicName, topicListenersOptions);
            }
            else {
                _waitingForSubscribe.push({name: topicName, options: topicListenersOptions});
            }
        };
        /**
         * Unsubscribe a *Service* from a *Topic* via  *BusinessWidgetHub*.
         * @method unsubscribeTopic
         * @param {String} topicName *Topic* name
         * @param {Object} [options] *Topic* configuration object
         * @param {Object} [options.vmKeys] vmKeys object
         * @param {String} [options.vmId] view model require path
         * @param {String} [options.mode] *Topic* mode
         */
        this.unsubscribeTopic = function ( topicName, topicListenersOptions ){
            if ( this._hasExpPackageLoaded() ) {
                _amdocsExpPackageHub.unsubscribe( topicName, topicListenersOptions );
            }
            else {
                for (var i = 0 ; i < _waitingForSubscribe.length ; i++) {
                    var obj = _waitingForSubscribe[i];
                    if ( obj.name === topicName && obj.options === topicListenersOptions ) {
                        _waitingForSubscribe.splice( i, 1 );
                        break;
                    }
                }
            }
        };
        /**
         * Returns whether a *Topic* is a Write only topic.

         * @method isTopicReadOnly
         * @param {String} topicName *Topic* name
         * @return {Object} return true if write only, false if not and undefined if the topic is not registered.
         **/
        this.isTopicWriteOnly = function ( topicName ){
            if ( !this._hasExpPackageLoaded() ) {//we didn't received the hub object yet.
                return undefined;
            }
            if (!_amdocsExpPackageHub.isTopicWriteOnly){//9.1 BWC
                return false;
            }
            return _amdocsExpPackageHub.isTopicWriteOnly( topicName );
        };
        /**
         * Returns whether a *Topic* is a Read only topic.

         * @method isTopicReadOnly
         * @param {String} topicName *Topic* name
         * @return {Object} return true if read only, false if not and undefined if the topic is not registered.
         **/
        this.isTopicReadOnly = function ( topicName ){
            if ( !this._hasExpPackageLoaded() ) {//we didn't received the hub object yet.
                return undefined;
            }
            return _amdocsExpPackageHub.isTopicReadOnly( topicName );
        };
        /**
         * Publishes data to *Topic*.

         * @method publish
         * @param {String} name topicName
         * @param {Object} topicData topic data
         * @param {String} [action] action to be handled after publish
         **/
        this.publish = function ( topicName, topicData, action ){
            if ( !this._hasExpPackageLoaded() ) {//we didn't received the hub object yet.
                throw 'Amdocs Experiance Package Hub is not ready for work yet.';
            }
            _amdocsExpPackageHub.publish( topicName, topicData, action );
        };

        this.$get = function (){
            return {
                subscribeTopic: this.subscribeTopic,
                unsubscribeTopic: this.unsubscribeTopic,
                isTopicWriteOnly: this.isTopicWriteOnly,
                isTopicReadOnly: this.isTopicReadOnly,
                publish: this.publish,
                _hasExpPackageLoaded: this._hasExpPackageLoaded
            };
        };
    },
    uxfWrapper : function ( uxfHub ){
        var createdTopicsByName = amdocs.utils.polyfill.createArray([]);
        var TopicWrapper = function ( topicName ){
            var topicListenersArr =  amdocs.utils.polyfill.createArray([]);//list of callback function that requested to registered for the current topic events.       
            var _lastTopicData;
            var topicHanler = function ( event ){
                _lastTopicData = event.data;
                angular.forEach( topicListenersArr.slice( 0 )/*Done so that called function can remove the registered callbacks*/,
                    function ( callbacksObj ){
                        switch ( event.action ) {
                            case '$change':
                                callbacksObj.change( event );
                                break;
                            case '$subscribe':
                                callbacksObj.subscribe( event );
                                break;
                            default:
                                callbacksObj.action( event );
                                break;
                        }
                    },
                    this );
            };
            var topicListenersOptions = {
                handler: topicHanler,
                context: this
            };

            /**
             * Add another listener to receive events fired by the topic.
             * @param registerCallback - Object in the format of {change,subscribe,action} where each point to a callback function called when events are received from the topic
             * @private
             */
            var _addTopicListener = function ( registerCallback ){
                if ( uxfHub.isTopicWriteOnly( topicName ) ) {
                    //This topic is a Write only topic. no need to listen to any actions/data changes.
                    registerCallback.subscribe( {data: undefined, action: '$subscribe'} );
                    return;
                }
                topicListenersArr.push( registerCallback );
                if ( _lastTopicData && registerCallback.subscribe ) {//because we register only once to the hub, each time a service request to listen for a topic he receive a "fake" subscribe event.
                    registerCallback.subscribe( {data: _lastTopicData, action: '$subscribe'} );
                }
            };
            var _removeTopicListener = function ( registerCallback ){
                var idx = topicListenersArr.indexOf( registerCallback );
                if ( idx >= 0 ) {
                    topicListenersArr.splice( idx, 1 );
                }
            };
            /**
             * Return the inner object pointed by the path
             * @param obj - The parent object.
             * @param path - A path represented as a string
             * @param extend - boolean flag indicating if the path should be created if not defined.
             * @private
             * Return pointer to the inner object
             */
            var _getObjByPath = function ( obj, path, extend ){
                var frags, frag;

                if ( typeof path === 'string' ) {
                    path = path.replace( /\[(\w+)\]/g, '.$1' );
                    path = path.replace( /^\./, '' );
                    frags = path.split( '.' );

                    while ( frags.length ) {
                        frag = frags.shift();

                        if ( typeof(obj) !== 'object' ) {
                            return undefined;
                        }
                        if ( extend && !(frag in obj) ) {
                            obj[frag] = {};
                        }
                        obj = obj[frag];
                    }
                }
                return obj;
            };
            var _extendInPath = function ( dstObj, path, srcObj ){
                dstObj = _getObjByPath( dstObj, path, true );
                if (!amdocs.utils.isScope(srcObj)) {
                    srcObj = angular.copy(srcObj);
                }
                angular.extend( dstObj, srcObj);
            };

            /**
             * Constructor
             */
            this.initialize = function (){
                uxfHub.subscribeTopic( topicName, topicListenersOptions );
            };
            /**
             * Destructor
             */
            this.destroy = function (){
                uxfHub.unsubscribeTopic( topicName, topicListenersOptions );
                topicListenersArr =  amdocs.utils.polyfill.createArray([]);
            };
            /**
             * A one time request to the current topic data.
             * @param callback - A callback function that should be called with the current topic data.
             */
            this.fetchTopicInfo = function ( callback ){
                if ( !angular.isFunction( callback ) ) {
                    throw 'Argument exception: callback must be a function.';
                }
                var registerCallback = {subscribe: function (){
                    callback( _lastTopicData );
                    _removeTopicListener( registerCallback );
                }};
                _addTopicListener( registerCallback );
            };
            /**
             * Synchronize between the scope and the topic information.
             * 1. The scope always hold the topic data (except for WriteOnly topics)
             * 2. Changes to the scope are propagated to the topic.
             * 3. Events fired by the topic are triggered as $emit event to the scope.
             * @param $scope - The scope to synchronize with
             * @param topicPathInScope - The object name in the scope where all the topic data is located.
             */
            this.syncScope = function ( $scope, topicPathInScope ){
                var deregisterWatchFunc, changedData = {}; //Hold changed topic data before the topic is loaded.
                var topicChangeHandler = function ( event ){
                    _extendInPath( $scope, topicPathInScope, event.data );
                    if ( !$scope.$root.$$phase ) {
                        $scope.$digest();
                    }
                };
                var scopeChanged = function (newData){
                    var data = _getObjByPath( $scope, topicPathInScope );
                    if (!amdocs.utils.isScope(data)) {
                        data = angular.copy(data);
                    }
                    if (uxfHub._hasExpPackageLoaded()){
                        uxfHub.publish(topicName, data);
                    }
                    else{
                        angular.extend(changedData,newData);
                    }
                };
                var registerToScopeWatch = function () {
                    if (deregisterWatchFunc){
                        deregisterWatchFunc();
                    }
                    deregisterWatchFunc = $scope.$watch( topicPathInScope, scopeChanged, true );
                };
                var topicSubscribeHandler = function ( event ){
                    angular.extend(event.data,changedData);
                    topicChangeHandler( event );
                    registerToScopeWatch();
                };
                var topicActionHandler = function ( event ){
                    $scope.$emit( event.action, event.data );
                    $scope.$emit( '$actions', event );
                };
                var registerCallback = {change: topicChangeHandler, subscribe: topicSubscribeHandler, action: topicActionHandler};

                _addTopicListener( registerCallback );
                registerToScopeWatch();

                var self = this;
                var deregistrationFunc = $scope.$on( '$destroy', function (){
                    self.destroy();
                } );
                var stopSyncFunc = function (){
                    _removeTopicListener( registerCallback );
                    deregistrationFunc();
                    if ( deregisterWatchFunc ) {
                        deregisterWatchFunc();
                    }
                };
                return stopSyncFunc;
            };
            /**
             * publish the action.
             * @param actionName - The action name.
             */
            this.triggerAction = function ( actionName ){
                uxfHub.publish( topicName, {}, actionName );
            };
            this.getMyName = function (){
                return topicName;
            };
            this._hasExpPackageLoaded = function(){
                return uxfHub._hasExpPackageLoaded();
            };

            this.initialize();
        };

        this.wrap = function ( $provide, $compileProvider, $controllerProvider, uxfConfig ){
            var createTopic = function ( topicName, scopeContainerName ){
                var topicFactoryName = topicName + 'Factory';
                scopeContainerName = scopeContainerName || 'uxfData';

                if ( createdTopicsByName.indexOf( topicFactoryName ) < 0 ) {
                    $provide.factory( topicFactoryName, [function (){
                        return new TopicWrapper( topicName );
                    }] );

                    $controllerProvider.register( topicName + 'Controller', ['$scope', topicFactoryName, function ( $scope, topic ){
                        topic.syncScope( $scope, scopeContainerName );
                    }] );

                    createdTopicsByName.push( topicFactoryName );
                }
                return topicFactoryName;
            };
            var createWidget = function ( widgetName, widgetPath, usedTopicsName ){
                var directiveFactory = function (){//all the widget used topics are passed as arguments.
                    var myTopics = Array.prototype.slice.call( arguments, 0, arguments.length - 1 );
                    var $parse = arguments[arguments.length - 1];

                    var domIdentifier = 'amdocs-uxf-' + widgetName;
                    return {
                        template: '<div class="amdocs-uxf-widget ' + domIdentifier + '"></div>',
                        restrict: 'E',
                        scope: {
                            servicesData: '='
                        },
                        link: function postLink ( scope, element, attrs ){
                            var onWidgetLoaded = function(){
                                var onTopicAction = function ( angularEvent, topicEvent ){
                                    var attrName = topicEvent.action;
                                    if ( attrs[attrName] ) {
                                        var parentGet = $parse( attrs[attrName] );
                                        parentGet( scope.$parent, topicEvent );
                                    }
                                };
                                var servicesDataAttrName = 'servicesData';
                                if ( angular.isUndefined( scope.servicesData ) ) {
                                    servicesDataAttrName = 'uxfData';
                                    scope[servicesDataAttrName] = {};
                                }

                                angular.forEach( myTopics, function ( topic ){
                                    topic.syncScope( scope, servicesDataAttrName + '.' + topic.getMyName() );
                                    scope.$on( '$actions', onTopicAction );
                                } );
                                scope.$on( '$destroy', function (){
                                    scope.myWidget.destroy();
                                } );
                            };

                            var widgetConfig = {
                                el: element.children()[0],
                                config: attrs
                            };


                            if (typeof(widgetPath) === 'object'){
                                require( [
                                    'jquery',
                                    'lightsaber',
                                    widgetPath.expPackgePath
                                ], function ( $, Lightsaber, expPackage ){
                                    var self = this;
                                    expPackage[widgetPath.widgetName]( widgetConfig , function(widget) {
                                        scope.myWidget = widget;
                                        onWidgetLoaded.call(self);
                                    } );
                                } );
                            }
                            else{
                                require( [
                                    'jquery',
                                    'lightsaber',
                                    widgetPath
                                ], function ( $, Lightsaber, Widget ){
                                    scope.myWidget = new Widget( widgetConfig );
                                    onWidgetLoaded();
                                } );
                            }
                        }
                    };
                };

                var directiveFactoryArr = angular.copy( usedTopicsName );
                directiveFactoryArr.push( '$parse' );
                directiveFactoryArr.push( directiveFactory );

                $compileProvider.directive( widgetName, directiveFactoryArr );
            };

            angular.forEach( uxfConfig.topics, function ( topic ){
                createTopic( topic.name );
            } );
            angular.forEach( uxfConfig.widgets, function ( widget ){
                var topicsNamesArr = [];
                if ( widget.topics ) {
                    angular.forEach( widget.topics, function ( topic ){
                        topicsNamesArr.push( createTopic( topic.name ) );
                    } );
                }
                createWidget( widget.name, widget.path, topicsNamesArr );
            } );
        };
        this.$get = function (){};
    }
};

amdocs.wrapAsAngular = function(uxfConfig,expPackage,moduleName){
    if (!moduleName){
        moduleName = 'amdocs.uxf';
    }
    if (!expPackage){
        expPackage = 'amdocsExpPackage';
    }
    var angularModule;
    try{
        angularModule = angular.module(moduleName);
    }
    catch(e){
        angularModule = angular.module(moduleName, []); //create a new module if not created otherwise use the created module.
    }

    angularModule.constant('expPackage',expPackage);
    angularModule.provider('uxfHub', ['expPackage', amdocs.providers.uxfHub ] );
    angularModule.provider( 'uxfWrapper', ['uxfHubProvider', amdocs.providers.uxfWrapper] );
    angularModule.config(['uxfWrapperProvider','$compileProvider','$provide','$controllerProvider', function(uxfWrapper,$compileProvider,$provide,$controllerProvider) {
        uxfWrapper.wrap($provide,$compileProvider,$controllerProvider,uxfConfig);
    }]);
};