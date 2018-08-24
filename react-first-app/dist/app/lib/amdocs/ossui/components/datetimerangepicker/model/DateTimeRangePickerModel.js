define(
        'ossui/widget/DateTimeRangePickerModel',
        [ 'underscore', 'lightsaber' ], function(_, Lightsaber) {

    var DateTimeRangePickerModel = Lightsaber.Core.RESTModel.extend({

        defaults : {
			rangeDropdown : null,
			fromDate : null,
			toDate : null
        }

    });

    return DateTimeRangePickerModel;
});