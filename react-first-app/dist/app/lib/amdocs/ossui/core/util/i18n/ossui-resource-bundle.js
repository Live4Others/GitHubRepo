define([
    'underscore',
    'backbone',
    'lightsaber',
    'messages'
],
    function(_, Backbone,Lightsaber, localMessages) {

       var ossui_i18n = function(options){

          //defaults:
           this.basedir ='nls';
           this.filename ='messages.json';
           this.localeConfigs = {
                 en_US : {
                     dateFormat : "mm/dd/yyyy",
                     type : "en_US",
                     currency : {
                         symbol : "$",
                         position : "start"
                     },
                     number : {
                         decimalSeparator : ".",
                         thousandSeparator : ","
                     }

                 },
                 en_UK : {
                     dateFormat : "dd/mm/yyyy",
                     type : "en_UK",
                     currency : {
                         symbol : "Â£",
                         position : "start"
                     },
                     number : {
                         decimalSeparator : ".",
                         thousandSeparator : ","
                     }
                 },
                 fr_FR : {
                     dateFormat : "dd/mm/yyyy",
                     type : "fr_FR",
                     currency : {
                         symbol : "â¬",
                         position : "end"
                     },
                     number : {
                         decimalSeparator : ",",
                         thousandSeparator : " "
                     }
                 }
           };
           this.getCurrentLocale = function() {
               return this.localeConfigs["en_UK"];
           };
           this.currentLocaleType =  this.getCurrentLocale().type;

           this.messagesURL = this.basedir +  '/' +this.currentLocaleType+ '/' +this.filename;

           // this.getResourceContentviaREST  = function(messagesURL) {
           // 
           // rest ds
           // 
           
           this.getResourceContent = function(messagesURL) {

                var ajaxResponseForRemoteMessages = $
                    .ajax({

                        beforeSend : function(x) {
                            if (x && x.overrideMimeType) {
                                x
                                    .overrideMimeType("application/j-son;charset=UTF-8");
                            }
                        },
                        dataType : "json",
                        type : "GET",
                        async : false, // calling AJAX *synchronously*
                        url : messagesURL, // Note : this can be any
                        // file (local or remote).
                        complete : function(ajaxData) {
                            return ajaxData;
                        },
                        success : function(data) {
                            return data;
                        },
                        error : function(ajaxData, textStatus,
                                         errorThrown) {
                            alert('Error when fetching localization data:'
                                + textStatus);
                        }
                    });// ajax call

                var remoteFileContent = $
                    .parseJSON(ajaxResponseForRemoteMessages.responseText);

                // if the file is empty , then use the globally declared
                // "messages" file
                var parsedMessages = ($.isEmptyObject(remoteFileContent) === true) ?
                    localMessages
                    :
                    // the actual strings are underneath a root called "messages"
                    $.parseJSON(ajaxResponseForRemoteMessages.responseText).messages;

                return parsedMessages;
            };

            this.getResourceContentFromREST = function(messagesURL){
                var LoginModel = Lightsaber.Core.RESTModel.extend({
                    url: "messages"
                });
            };

              /* this.currentLocale = function() {
               return this.getCurrentLocale();
           };*/

           /**
            * Get a translated string keyed by 'key'
            */

           if(options){

               this.localeConfigs = options.localeConfigs || this.localeConfigs;
               //should there be a default url ?
               this.messagesURL = options.messagesURL ;
            }

           //this.parsedMessages =  this.getResourceContent(this.messagesURL);
           this.parsedMessages = this.getResourceContentFromREST(this.messagesURL);
           
           this.resourceBundle = new Lightsaber.Core.ResourceBundle({
               defaultBundle : this.parsedMessages
           }, 'defaultBundle');

           this.getString = function(key, params) {
               return this.resourceBundle.getString(key, params);
           };

           this.getMessage = function(key, args) {
               return this.getString(key, args);
           };

    };
      return ossui_i18n;
});