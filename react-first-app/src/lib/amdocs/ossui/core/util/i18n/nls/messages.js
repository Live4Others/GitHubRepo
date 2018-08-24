/**
 * Strings used by the localization process.
 * Parameters inside the message to be set by the usual
 * {0}..{1}...{n} placeholders
 */
define(
        {
/* If the require js i18n plug is to be used , then some Locale indicators are to be used
See the Lightsaber documentation for that            
        "root": true,
        "fr": true,
        "en": true,
*/
    /*********************************
     * Common strings 
     *********************************/
    "common_backButton": "Back",
    "common_confirm": "Confirm",
    
    "common_nextButton": "Next",
    "common_previousButton": "Previous",
    
    "common_cancel": "Cancel",
    "common_yes":"Yes",
    "common_no":"No",
    
    "common_save" : "Save",

    /*********************************
     * Messages for the Validation Use Case   
     *********************************/
    "validate_numeric": "Non numeric input for {0}",
    "validate_required": "Input required for {0}",
    
    "validate_max_length": "Input string longer than {0} ; it was {1} in length",
    "validate_min_length": "Input string shorter than  {0} ; it was {1} in length",

    "validate_max_value": "Input value greater than {0} ",
    "validate_min_value": "Input value less than {0} ",

    "validate_date": "Input not in Date format for {0}",
    "validate_date_past": "Date should be less than threshold of: {0}",
    "validate_date_future": "Date should exceed threshold of: {0}",
    

    "validate_pattern": "Unrecognized pattern for {0}",
    
    "validate_failed": "Validation Failed!",
    "validate_ok": "Validation Succeeded!"
    
    /*********************************
     * Use Case XYZ 
     *********************************/


});