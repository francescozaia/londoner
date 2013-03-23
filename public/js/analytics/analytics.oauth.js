;(function ( _analytics, undefined ) {

    'use strict';

    var $authorizeButtonElement;

    function handleAuthorizationResult (authResult) {

        if (authResult) {
            gapi.client.load('analytics', 'v3', handleAuthorized);
        } else {
            handleUnauthorized();
        }
    }

    function handleAuthorized () {
        // moving into "/profile"
        //History.pushState({state:1}, "Profile", "./profile");

        $('.home_panel').hide();
        $('.profile_panel').show();
        if ($authorizeButtonElement != undefined) {
            $authorizeButtonElement.hide();
        }
        window.analytics_stats.makeApiCall();
    }

    function handleUnauthorized() {
        /*
        History.pushState({state:2}, "Authenticate", "authenticate");
        $goButtonElement.hide();
        */
        $('.home_panel').fadeIn();
        $('.profile_panel').fadeOut();
        var div = $('<button/>')
                .attr('id', 'authorize-button')
                .text('authorize');
        $authorizeButtonElement = div.appendTo('#authenticationPanel');
        $authorizeButtonElement.click(function() {
            checkAuthorization(false);
        });
        alert('Please authorize this script to access Google Analytics.');
    }

    function checkAuthorization(immediateMode) {
        var clientId = '307689118189-opj4m74o1gqk19o2slt28ho12kh4bmg8.apps.googleusercontent.com';
        var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

        gapi.auth.authorize({
            client_id: clientId,
            scope: scopes,
            immediate: immediateMode
        }, handleAuthorizationResult);
    }
    
    _analytics.initialize = function () {
        var apiKey = 'AIzaSyCWq6sWLWRqWkzKTSSeHNDAx7UbKD3434M';

        gapi.client.setApiKey(apiKey);
        setTimeout(function() {
            checkAuthorization(true);
        }, 1);
    };

}(window.analytics_oauth = window.analytics_oauth || {}));