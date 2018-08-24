define('ossui/utils/OSSUIBasicResourceBundle',[
    'underscore',
    'backbone',
    'lightsaber',
    'messages',
    'ossui/utils/OSSUIResourceBundle'
],
    function(_, Backbone,Lightsaber, localMessages,OSSUIResourceBundle) {
        /*jshint camelcase:false*/
        var ossui_i18n = function(options){
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
                        symbol : "?"
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
                        symbol : "?",
                        position : "end"
                    },
                    number : {
                        decimalSeparator : ",",
                        thousandSeparator : " "
                    }
                },
                ru_RU : {
                    dateFormat : "dd/mm/yyyy",
                    type : "ru_RU",
                    currency : {
                        symbol : "???",
                        position : "end"
                    },
                    number : {
                        decimalSeparator : ".",
                        thousandSeparator : " "
                    }
                }

            };
            this.getCurrentLocale = function() {
                return this.localeConfigs[this.currLocaleKey];
            };
            /*jshint camelcase:false*/
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
                            throw new Error('Error when fetching localization data:'
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



            /* this.currentLocale = function() {
             return this.getCurrentLocale();
             };*/

            /**
             * Get a translated string keyed by 'key'
             */

            if(options){
                 if(options.customdir){
                     this.basedir = options.basedir || 'lib/amdocs/ossui/components/login/nls';
                     this.filename = options.filename || 'ossui-login-messages.json';
                     this.messagesURL = this.basedir +  '/' + this.filename;
                 }
                 else{
                    this.currLocaleKey = options.locale || 'en_UK';
                    this.basedir = options.basedir || 'lib/amdocs/ossui/components/login/nls';
                    this.filename = options.filename || 'ossui-login-messages.json';
                    this.localeConfigs = options.localeConfigs || this.localeConfigs;
    
                    if(this.getCurrentLocale()){
                        this.currentLocaleType =  this.getCurrentLocale().type;
                    } else{
                        this.currentLocaleType =  options.currentLocaleType || this.currLocaleKey;
                    }
                    this.messagesURL = options.messagesURL || this.basedir +  '/' +this.currentLocaleType+ '/' +this.filename;
                 }
            }else{
                this.currLocaleKey = 'en_UK';
                this.basedir = 'lib/amdocs/ossui/components/login/nls';
                this.filename = 'ossui-login-messages.json';
                this.currentLocaleType = 'en_UK';
                this.messagesURL = this.basedir +  '/' +this.currentLocaleType+ '/' +this.filename;
            }
            this.parsedMessages =  this.getResourceContent(this.messagesURL);
            this.resourceBundle = new Lightsaber.Core.ResourceBundle({
                defaultBundle : this.parsedMessages
            }, 'defaultBundle');

            this.populateOssuiResourceBundle = function(){
                for(var i=0;i<Object.keys(this.parsedMessages).length;i++){
                    var messageKey = Object.keys(this.parsedMessages)[i];
                    OSSUIResourceBundle.prototype.resourceBundle[messageKey] = this.parsedMessages[messageKey];
                }
            };
            this.getString = function(key, params) {
                return this.resourceBundle.getString(key, params);
            };

            this.getMessage = function(key, args) {
                return this.getString(key, args);
            };

        };
        return ossui_i18n;
    });