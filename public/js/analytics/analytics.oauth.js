;(function ( _analytics, undefined ) {

    'use strict';

    var $authorizeButtonElement;


    /**
    * Handler that is called once the script has checked to see if the user has
    * authorized access to their Google Analytics data. If the user has authorized
    * access, the analytics api library is loaded and the handleAuthorized
    * function is executed. If the user has not authorized access to their data,
    * the handleUnauthorized function is executed.
    * @param {Object} authResult The result object returned form the authorization
    *     service that determine whether the user has currently authorized access
    *     to their data. If it exists, the user has authorized access.
    */
    function handleAuthorizationResult (authResult) {

        if (authResult) {
            gapi.client.load('analytics', 'v3', handleAuthorized);
        } else {
            handleUnauthorized();
        }
    }


    /**
    * Updates the UI once the user has authorized this script to access their
    * data. This changes the visibiilty on some buttons and adds the
    * makeApiCall click handler to the run-demo-button.
    */
    function handleAuthorized () {
        // moving into "/profile"
        History.pushState({state:1}, "Profile", "./profile");

        $('.home_panel').hide();
        $('.profile_panel').show();
        if ($authorizeButtonElement != undefined) {
            $authorizeButtonElement.hide();
        }
        window.analytics_stats.makeApiCall();
    }


    /**
    * Updates the UI if a user has not yet authorized this script to access
    * their Google Analytics data. This function changes the visibility of
    * some elements on the screen. It also adds the handleAuthClick
    * click handler to the authorize-button.
    */
    function handleUnauthorized() {
        History.pushState({state:2}, "Authenticate", "authenticate");
        //$goButtonElement.hide();
        $('.home_panel').show();
        $('.profile_panel').hide();
        var div = $('<button/>')
                .attr('id', 'authorize-button')
                .text('Autorizza');
        $authorizeButtonElement = div.appendTo('#authenticationPanel');
        $authorizeButtonElement.click(function() {
            checkAuthorization(false);
        });
        //utils.outputToPage('Please authorize this script to access Google Analytics.');
    }

    /**
    * Uses the OAuth2.0 clientId to query the Google Accounts service
    * to see if the user has authorized. Once complete, handleAuthResults is
    * called.
    */
    function checkAuthorization(immediateMode) {
        var clientId = '307689118189-opj4m74o1gqk19o2slt28ho12kh4bmg8.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

        gapi.auth.authorize({
            client_id: clientId,
            scope: scopes,
            immediate: immediateMode
        }, handleAuthorizationResult);
    }

    /**
    * Callback executed once the Google APIs Javascript client library has loaded.
    * The function name is specified in the onload query parameter of URL
    * to load this library. After 1 millisecond, checkAuth is called.
    */
    _analytics.initialize = function () {
        var apiKey = 'AIzaSyCWq6sWLWRqWkzKTSSeHNDAx7UbKD3434M';

        gapi.client.setApiKey(apiKey);
        setTimeout(function() {
            checkAuthorization(true);
        }, 1);
    };

}(window.analytics_oauth = window.analytics_oauth || {}));