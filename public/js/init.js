;(function ( _init, undefined ) {
    
    _init.go = function() {
        initDatepicker();
        initCheckbox();
        initButton();
    }

    function initDatepicker() {
    	$( "#from" ).datepicker({
            dateFormat: "yy-mm-dd",
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1,
            onClose: function( selectedDate ) {
				$( "#from" ).val(selectedDate);
				$( "#from" ).datepicker( "option", "minDate", selectedDate );
            }
        });
        $( "#to" ).datepicker({
            dateFormat: "yy-mm-dd",
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1,
            onClose: function( selectedDate ) {
				$( "#to" ).val(selectedDate);
				$( "#to" ).datepicker( "option", "maxDate", selectedDate );
            }
        });
    };

    function initCheckbox() {
    	$( "#check" ).button();
        $( "#format" ).buttonset();
    };

    function initButton() {
    	$( "button" ).button().click(function( e ) {
    		e.preventDefault();
    	});
    };

}(window.init = window.init || {}));