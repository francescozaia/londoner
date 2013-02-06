;(function (window, undefined) {

	var History = window.History,
		$ = window.jQuery,
		document = window.document;

	if ( !History.enabled ) {
		return false;
	}

	// Bind to StateChange Event
    History.Adapter.bind(window,'statechange',function(){
        var State = History.getState();
        History.log(State.data, State.title, State.url);
    });

    /* Change our States
    History.pushState({state:1}, "State 1", "?state=1"); // logs {state:1}, "State 1", "?state=1"
    History.pushState({state:2}, "State 2", "?state=2"); // logs {state:2}, "State 2", "?state=2"
    History.replaceState({state:3}, "State 3", "?state=3"); // logs {state:3}, "State 3", "?state=3"
    History.pushState(null, null, "?state=4"); // logs {}, '', "?state=4"
    History.back(); // logs {state:3}, "State 3", "?state=3"
    History.back(); // logs {state:1}, "State 1", "?state=1"
    History.back(); // logs {}, "Home Page", "?"
    History.go(2); // logs {state:3}, "State 3", "?state=3"
    */

})(window); // end closure