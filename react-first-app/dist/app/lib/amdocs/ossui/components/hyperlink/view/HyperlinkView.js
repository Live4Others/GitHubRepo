define('ossui/widget/HyperlinkView', [ 'jquery', 'underscore', 'lightsaber', 'text!lib/amdocs/ossui/components/hyperlink/view/template/hyperlink.html'
                                      ], function($, _, Lightsaber,
        defaultlinktemplate, defaultImagePath) {

    var hyperlinkView = Lightsaber.ButtonView.extend({
        /**
         * Overriden to retrieve user template and pass it to template else
         * provide the default link template for OSSUI
         */
        _preRender : function() {
            var mytemplate = this.getConfig('template');

            if (!mytemplate) {
                this.template = defaultlinktemplate;
            }
        },
        
        /**
         * Overriden to give workaround for UXF bug where it changes 
         * the complete span content instead of just name when the name is changed
         * in view model
         */
        refresh : function(event){
            if(event && (this.tagName !== 'input')) {
                this.$root.find('.ossui-hyperlink-text').contents()[0].data = event.value ;
                this.$root.button('refresh');
            } else {
                this._super(event);
            }
        
        },
        
        _postRender : function(){
            this._super();
            this.$root.addClass('ossui-hyperlink-class');
            var iconClass = this.getConfig('hyperlinkIconClass');            
            if(iconClass){
                this.$root.find('.ossui-hyperlink-icon').addClass(iconClass);
            }
            var iconHoverClass = this.getConfig('hyperlinkHoverIconClass');
            if(iconHoverClass){
                this.$root.on('mouseover', _.bind(function() {
                    this.$root.find('.ossui-hyperlink-icon').addClass(iconHoverClass);
                }, this));
                this.$root.on('mouseout', _.bind(function() {
                    this.$root.find('.ossui-hyperlink-icon').removeClass(iconHoverClass);
                }, this));
            }else {
                this.$root.on('mouseover', _.bind(function() {
                    this.$root.find('.ossui-hyperlink-icon').addClass('ossui-hyperlink-icon-hover');
                }, this));
                this.$root.on('mouseout', _.bind(function() {
                    this.$root.find('.ossui-hyperlink-icon').removeClass('ossui-hyperlink-icon-hover');
                }, this));
            }           
        } 
    });
    return hyperlinkView;

});