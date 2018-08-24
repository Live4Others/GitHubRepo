/*
 * This object attempts to supply a resource bundle to the LightSaber i18n routine.
 * It then delegates the fetching of the localized string to the super "Lightsaber" method -  
 * which in its turn executes the parameters insertions as well.
 * Code structure based on an ARIM codebase example.  
 */
define([
    'underscore', 
    'lightsaber', 
    'messages'
],
function(_, Lightsaber, localMessages) {


            var defaultDirBase = 'nls'; 
            var defaultFilename = 'messages.json';

    // Config locales
            var localeConfigs = {
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

            var helperMethods = {
                getCurrentLocale : function() {
                    // a provisional "english" default
          return localeConfigs["en_UK"];
                },

                getResourceContent : function(messagesURL) {

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
                }

            };

        var i18nOperations = {
                /**
                 * Get the current locale as set in the login model
                 */
                currentLocale : function() {
                    return helperMethods.getCurrentLocale();
                },

                /**
                 * Get a translated string keyed by 'key'
                 */
                getString : function(key, params) {
                    return resourceBundle.getString(key, params);
                }

            };
    
   
            var currentLocaleType = helperMethods.getCurrentLocale().type;
            var defaultMessagesURL = defaultDirBase +  '/' +currentLocaleType+ '/' +defaultFilename;
            var parsedMessages =  helperMethods.getResourceContent(defaultMessagesURL);

    
            var resourceBundle = new Lightsaber.Core.ResourceBundle({

                defaultBundle : parsedMessages
            }, 'defaultBundle');

            var i18n = function(key, args) {
                return i18nOperations.getString(key, args);
            };

            _.extend(i18n, i18nOperations);

    // When each view is configured we need to replace the method _getLocaleString
    // which provides the 18n object. It's not enough to override that method
    // because when that method is bound to the object inside _configure it loses the enhanced functions        
    var _configure = Lightsaber.Core.View.prototype._configure;
            Lightsaber.Core.View.prototype._configure = function(options) {
                // Let the original configuration take place
                _configure.call(this, options);
                //Override the method so our enhanced 18n is returned
                this._getLocaleString = i18n;
            };
    
    return i18n;
});