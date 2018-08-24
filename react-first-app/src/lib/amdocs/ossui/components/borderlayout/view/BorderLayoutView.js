/**
* $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-client-zip/src/main/webapp/lib/amdocs/ossui/components/borderlayout/view/BorderLayoutView.js#1 $
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

/**
 * @class BorderLayoutView
 * @augments TBD
 * @custLevel OSSUI
 * @type Lightsaber.Core.View
 * @memberOf Ossui
 * @name BorderLayoutView
 * @property TBD
 * @version TBD
 *
 * @description
 *
 * This class provides visual representation of Border Layout using jQuery Layout API.
 * It creates 5 panes - called Center, North, South, East and West panes. Center pane is mandatory.
 * All other panes are options. Nested panes can also be created upto multiple levels of nesting.
 * This gives the freedom of splitting the whole display area into various desirable sections.
 *
 * Settings for various panes can be provided via Model (from backend service) (or) provided during
 * instantiation of layout view. Precedence is given to the settings available in the model. If nothing
 * is present in Model (ViewModel), then the settings provided during the instantiation of this view.
 * If both are not present then the default config settings comes part of this class definition will be
 * used to construct the panes.
 *
 * Details about the required panes are provided via 'layoutSettings' and it will be in the form shown below,
 *
 *      { 'id' : 'ossui-outer-center', 'position' : 'center', 'cssClass':'my2ndCSS',
 *         'childLayout': [
 *               { 'id' : 'ossui-middle-center', 'position' : 'center','header' : true,},
 *               { 'id' : 'ossui-middle-north', 'position' : 'north', 'header' : true, 'cssClass':'myOwn','center__minWidth' : 300,
 *                      'center__maxWidth' : 300, 'east__size' : 800, 'north__size' : 100,'south__size' : 100, 'spacing_open' : 8, 'spacing_closed' : 12,},
 *               { 'id' : 'ossui-middle-east', 'position' : 'east',
 *                   'childLayout': [
 *                       { 'id' : 'ossui-inner-center', 'position' : 'center',},
 *                       { 'id' : 'ossui-inner-west', 'position' : 'west', 'header' : true,},
 *                       { 'id' : 'ossui-inner-north', 'position' : 'north', 'header' : true,},
 *                        ]},
 *               { 'id' : 'ossui-middle-south', 'position' : 'south',},
 *         ]},
 *     { 'id' : 'ossui-outer-west', 'position' : 'west', 'cssClass':'my2ndCSS', 'west__size' : 125,},
 *
 * with the above settings, whole displayable area is divided into two outer panes - center and west.
 * The center pane is further divided into 4 child panes - center, north, south and east. And this east
 * (middle layer) pane is further divided into 3 inner panes - center, west and north.
 *
 * <strong>Important points to be noted:</strong>
 *
 *  - Center pane is mandatory in all layers - outer and nested layers.
 *  - Parameters - <strong>'id', 'position', 'header', 'cssClass' & 'childLayout'</strong> are 'OSSUI' framework defined.
 *  - Remaining parameters (except the above mentioned) are all <strong>jQuery Layout API</strong> defined.
 *
 * The above settings will generate a HTML template/skeleton as shown below, (please note how the id, cssClass and header
 * parameters are being used in creating the HTML structure.)
 *
 *      <div id="container">
 *           <div id="ossui-outer-center" class="my2ndCSS">
 *               <div id="ossui-middle-center"> <div id="ossui-middle-center-header" ></div> </div>
 *               <div id="ossui-middle-north"> <div id="ossui-middle-north-header" ></div> </div>
 *               <div id="ossui-middle-east">
 *                   <div id="ossui-inner-center"></div>
 *                   <div id="ossui-inner-west"> <div id="ossui-inner-west-header" ></div> </div>
 *                   <div id="ossui-inner-north"> <div id="ossui-inner-north-header" ></div> </div>
 *               </div>
 *               <div id="ossui-middle-south"></div>
 *           </div>
 *           <div id="ossui-outer-west" class="my2ndCSS"></div>
 *      </div>
 *
 * The above settings will formulate the object shown below, which will then passed to jQuery layout API.
 *
 * {
 *       center__paneSelector:   "#ossui-outer-center",
 *       west__paneSelector:     "#ossui-outer-west",
 *       west__size :   125,
 *       spacing_open:           8,  // for ALL panes
 *       spacing_closed:         12, // for ALL panes
 *
 *       // MIDDLE-LAYOUT (child of outer center pane)
 *       center__childOptions: {
 *           center__paneSelector:   "#ossui-middle-center",
 *           north__paneSelector:    "#ossui-middle-north",
 *           east__paneSelector:     "#ossui-middle-east",
 *           south__paneSelector:  "#ossui-middle-south",
 *           center__minWidth:  300,
 *           center__maxWidth:  300,
 *           east__size:    800,
 *           north__size:   100,
 *           south__size:  100,
 *           spacing_open:  8,  // for ALL panes
 *           spacing_closed:    12, // for ALL panes
 *
 *           east__childOptions: {
 *               center__paneSelector: "#ossui-inner-center",
 *               west__paneSelector: "#ossui-inner-west",
 *               north__paneSelector: "#ossui-inner-north",
 *           },
 *       }
 *   }
 *
 * @example
 *
 * <code>
 *      var settingsArr = [
 *          { 'id' : 'ossui-outer-center', 'position' : 'center', 'cssClass':'my2ndCSS',
 *               'childLayout': [
 *                    { 'id' : 'ossui-middle-center', 'position' : 'center','header' : true,},
 *                    { 'id' : 'ossui-middle-north', 'position' : 'north', 'header' : true, 'cssClass':'myOwn','center__minWidth' : 300,
 *                            'center__maxWidth' : 300, 'east__size' : 800, 'north__size' : 100,
 *                            'south__size' : 100, 'spacing_open' : 8, 'spacing_closed' : 12,},
 *                    { 'id' : 'ossui-middle-east', 'position' : 'east',
 *                         'childLayout': [
 *                              { 'id' : 'ossui-inner-center', 'position' : 'center',},
 *                              { 'id' : 'ossui-inner-west', 'position' : 'west', 'header' : true,},
 *                              { 'id' : 'ossui-inner-north', 'position' : 'north', 'header' : true,},
 *                          ]},
 *                    { 'id' : 'ossui-middle-south', 'position' : 'south',},
 *                ]},
 *          { 'id' : 'ossui-outer-west', 'position' : 'west', 'cssClass':'my2ndCSS', 'west__size' : 125,},
 *          ]];
 *
 *     var collection = new Lightsaber.Core.Collection(settingsArr);
 *
 *
 *     // Create CollectionViewModel to abstract over the data.
 *     var collectionViewModel = new Lightsaber.CollectionViewModel({
 *          models : { data : collection }
 *     });
 *
 *
 *     var borderLayoutView = new OSSUI.BorderLayoutView({
 *          viewModel: collectionViewModel,
 *          el: "#display-area",
 *
 *          config: {
 *              // Templates can be customized.
 *              template : '<div id="container" style="height:100%; ">\n</div>',
 *
 *              // This settings will be used 'iff' there is nothing fetched from backend.
 *              layoutSettings : [
 *                  { 'id' : 'ossui-outer-center', 'position' : 'center', 'cssClass':'my2ndCSS',
 *                      'childLayout': [
 *                          { 'id' : 'ossui-middle-center', 'position' : 'center','header' : true,},
 *                          { 'id' : 'ossui-middle-north', 'position' : 'north', 'header' : true, 'cssClass':'myOwn','center__minWidth' : 300,
 *                              'center__maxWidth' : 300, 'east__size' : 800, 'north__size' : 100,
 *                              'south__size' : 100, 'spacing_open' : 8, 'spacing_closed' : 12,},
 *                          { 'id' : 'ossui-middle-east', 'position' : 'east',
 *                              'childLayout': [
 *                                  { 'id' : 'ossui-inner-center', 'position' : 'center',},
 *                                  { 'id' : 'ossui-inner-west', 'position' : 'west', 'header' : true,},
 *                                  { 'id' : 'ossui-inner-north', 'position' : 'north', 'header' : true,},
 *                               ]},
 *                          { 'id' : 'ossui-middle-south', 'position' : 'south',},
 *                      ]},
 *                  { 'id' : 'ossui-outer-west', 'position' : 'west', 'cssClass':'my2ndCSS', 'west__size' : 125,},
 *                 ],
 *          },
 *        });
 *
 *       // Now I created the layout view and I can play with it.
 *      borderLayoutView.addToPane('ossui-outer-west', '<span> I can add any HTML content to a pane using pane ID</span>');
 *
 *      borderLayoutView.addToPaneHeader('ossui-outer-west', '<span> I can add any HTML content to a pane's header using pane ID</span>');
 *
 *      // Get any pane as jQuery object and use it during any of your view instantiation. <strong>Note: 'el' parameter</strong>.
 *
 *      var createSearchOIPaneButton = new Lightsaber.ButtonView({
 *                           el : borderLayoutView.getPane('ossui-inner-center'),
 *
 *                           config: { id : 'searchOIPaneButton' },
 *                           attributes: { href: '#', 'data-theme': 'b' },
 *                           viewModel : buttonViewModel
 *                       });
 *
 * </code>
 *
 */
define('ossui/widget/BorderLayoutView',
        [ 'lightsaber',
          'underscore',
          'jquery',
          'jquery.layout',
          'text!lib/amdocs/ossui/components/borderlayout/view/template/BLContainerTemplate.html',
          'text!lib/amdocs/ossui/components/borderlayout/view/template/BLPaneTemplate.html',
          'text!lib/amdocs/ossui/components/borderlayout/view/template/BLHeaderTemplate.html' ],
          function(Lightsaber, _, $, jQueryLayout, defaultContainerTmpl, defaultPaneTmpl, defaultHeaderTmpl) {

    var BorderLayoutView = Lightsaber.Core.View.extend({

        /**
         * Default values.
         */
        config: {
            layoutSettings : [
                              // TODO: What default layout that needs be shipped. To be decided by PDO.
                              ],
            
            /**
             * Flag represents whether to generate the HTML structure for the layout or not using templates.
             * If the HTML structure is pre-exist and want to apply the Border Layout on top of it, then this 
             * flag is set to flase and relevant borderlayout settings (compatible with jquery layout API) should 
             * be passed in 'layoutSettings' parameter. 
             */
            generateHTMLStructure : true
        },

        /**
         * Initialize the vmKeys
         */
        vmKeys: {
            "data.items" : "items"
        },

        idAttribute : 'id',

        // Default templates
        template : defaultContainerTmpl,
        paneTemplate : defaultPaneTmpl,
        headerTemplate : defaultHeaderTmpl,

        /**
         * Constructor callback
         */
        initialize: function(){
            
            this.idAttribute = this.getConfig('idAttribute') || this.idAttribute;

            this.template = this.getConfig('template') || this.template;
            this.paneTemplate = _.template(this.getConfig('paneTemplate')  || this.paneTemplate);
            this.headerTemplate = _.template(this.getConfig('headerTemplate')  || this.headerTemplate);

            // Bind the event listeners
            this.viewModel.on('items:loaded', this._constructLayout, this);
            //this.viewModel.on('items:added', this.addPane, this);
        },

        /**
         * Constructs the whole layout based on the details available in Model (or)
         * details provided when instantiating this layout view (or) some hard coded
         * default settings (not present right now) in this class.
         *
         * This method initiates construction- of various panes in the layout. Once the
         * HTML elements are constructed, it calls jQuery Layout API with the settings
         * fetched to construct the layout.
         *
         * Note:
         *  This will get called when the items are loaded in to the View Model.
         *
         * @name _constructLayout
         * @memberOf OSSUI.BorderLayoutView
         * @param layoutData
         *
         */
        _constructLayout: function(layoutData) {
            var settings = {};

            if (this.getConfig('generateHTMLStructure') === true) {
                var isHtmlBuilt = this._buildHtmlElements(layoutData, settings);
                
                // Check whether the required HTML skeleton has been created before proceeding with layouting...
                if (isHtmlBuilt){
                    //create unique root Id else jquery selection will return the first matching
                    //this needs to be done only if default root template used by border layout
                    //if application provides its own root then maintaining the uniqueness is the onus
                    //of the application 
                    if(this.root.id === 'container'){
                        this.root.id += ('-' + Lightsaber.Core.Utils.guid());
                    }
                    var containerSelector = "#" + this.root.id;
    
                    // create the layout by calling jQuery Layout API.
                    this.layoutObj = $(containerSelector).layout(settings);
                }    
            }else {
                this.layoutObj = this.$el.layout(this.getConfig('layoutSettings'));
            }
            
            this.trigger('layout:created', this);
        },

        /**
         * Constructs the layout based on details available in either
         * ViewModel (or) set when instantiating this class.
         */
        _postRender : function() {
            this._constructLayout();
        },

        /**
         * Build the HTML elements by looping thro' the settings provided.
         * @name _constructLayout
         * @memberOf OSSUI.BorderLayoutView
         * @param layoutData - Layout settings provided via Model (from backend)/when instantiating this view.
         * @param settings - Settings object that needs to be constructed for jQuery layout API
         */
        _buildHtmlElements: function(layoutData, settings) {

            var layoutSettingsArr = [];
            var isSuccessful = true;

            // Now, need to identify where the layout settings are available.
            if (! layoutData){
                var vmData = this.viewModel.getData() || this.viewModel.get();
                layoutSettingsArr = vmData.items;

                if (! layoutSettingsArr || layoutSettingsArr.length === 0) {
                    layoutSettingsArr = this.getConfig('layoutSettings');
                }
            }else if (layoutData.items && layoutData.items.length > 0){
                layoutSettingsArr = layoutData.items;
            }

            // Throw error if there isn't enough details to build the layout?
            if (! layoutSettingsArr || layoutSettingsArr.length === 0){
                // TODO: throw error.
                //console.log("That's bad. There isn't enough details to build the layout.");

                // Set the flag to indicate the error while constructing the layout.
                isSuccessful = false;
            }
            
            var noOfEntries = layoutSettingsArr.length;
            for (var count = 0; count < noOfEntries; count++) {
                var paneStr = $(this._createPaneStr(layoutSettingsArr[count], settings));
                this.$root.append(paneStr);               
            }

            return isSuccessful;
        },

        /**
         * It's a recursive method which creates pane for each section configured in settings
         * (provided via Model / during instantiation of layout view) and also constructs the
         * 'settings' object which will be passed to the jQuery Layout API.
         *
         * @param data - Layout settings provided via Model (from backend)/when instantiating this view.
         * @param settings - Settings object that needs to be constructed for jQuery layout API
         * @returns the constructed pane - HTML section (with sub sections)
         */
        _createPaneStr: function(data, settings) {

            var position = data.position;

            settings[position + '__paneSelector'] = '#' + data.id;
            var tempRoot = $(this.paneTemplate( data ));

            // Is 'header' asked for this pane?
            if (data.header === true) {
                tempRoot.append(this._createHeaderStr(data));
            }

            // Is this pane contains any child?
            if (data.childLayout){
                var childPaneSettings = data.childLayout;
                var childSettings = {};

                var noOfEntries = childPaneSettings.length;
                // Loop thro' all the children configured and construct panes for those.
                for (var count = 0; count < noOfEntries; count++) {
                    var childPaneStr = $(this._createPaneStr(childPaneSettings[count], childSettings));

                    // Append each child pane to its parent.
                    tempRoot.append(childPaneStr);
                }

                settings[position + '__childOptions'] = childSettings;
            }

            // Copy the remaining settings from Model.
            for (var key in data){
                if (key != 'id' && key != 'childLayout'){
                    settings[key] = data[key];
                }
            }

            return tempRoot;
        },
        
        /**
         * Creates the header section using the template and settings provided for a particualr
         * pane.
         *
         * @param data - Layout settings provided via Model (from backend)/when instantiating this view.
         * @returns the constructed header for a particular pane.
         */
        _createHeaderStr: function(data) {
            return  $(this.headerTemplate( data ));
        },

        /**
         * Gets pane (as jquery object) by ID (for population of content, for example)
         * @name getPane
         * @methodOf
         * @param {String} id - id of the pane interested in.
         * @returns the pane (as jquery object)
         */
        getPane : function(id) {
            var paneSelector = 'div[id="' + id + '"]';
            //var paneSelector = 'div:jqmData(pane-id="' + id + '")';
            return $(paneSelector);
        },
        
        /**
         * Adds HTML as content to a pane with the given ID
         * @name addToPane
         * @methodOf
         * @param {String} id id of the tab the pane belongs to
         * @param {String} HTML that represents the content to add to the pane
         */
        addToPane : function(id, html) {
            var pane = this.getPane(id);
            pane.append(html);
            pane.trigger('create');
        },

        /**
         * Get the header (as jquery object) of the pane using the pane's id.
         * @param id
         */
        getPaneHeader : function(id) {
            var headerSelector = 'div[id="' + id + '-header"]';
            return $(headerSelector);
        },

        /**
         * Adds HTML as content to the header of the pane using the pane's id.
         * @param id - Pane id whose header needs to be updated with HTML content.
         * @param html - HTML content that needs to updated to the header of a pane.
         */
        addToPaneHeader: function(id, html){
            var paneHeader = this.getPaneHeader(id);
            paneHeader.append(html);
            paneHeader.trigger('create');
        },
        
        /**
         * Get the layout object ( as constructed by jQuery layout API).
         * @returns the layout object ( as constructed by jQuery layout API).
         */
        getLayoutObj: function(){
            return this.layoutObj;
        }

    });

    return BorderLayoutView;
});
