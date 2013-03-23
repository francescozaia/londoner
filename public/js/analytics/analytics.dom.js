;(function ( _analytics, undefined ) {

    'use strict';

    _analytics.showError = function(string){
         utils.updatePage(string);
    };

    _analytics.createProfiles = function(response){

        var ulAccountsElement = $('<ul/>')
                .attr('id', 'accounts');

        $.each(response.items, function(i) {
            var listItem = $('<li/>')
                .addClass('accountItem')
                .appendTo(ulAccountsElement);

            var link = $('<a/>')
                .attr('id', 'profile_' +  response.items[i].id)
                .attr('data-profile', response.items[i].id)
                .attr('href', '#')
                .text(response.items[i].name)
                .on("click", window.analytics_dom.gotoWebProfiles)
                .appendTo(listItem);

        });
        ulAccountsElement.appendTo("#output");
        
    };


    _analytics.gotoWebProfiles = function(event){
        event.preventDefault();
        var profileID = $(this).attr('data-profile');
        /*
        moving into "/profile"
        
        History.pushState({state:3}, "Account", "account/" + profileID);
        */
        $('.data_panel').fadeIn();
        $('.profile_panel').fadeOut();
        window.analytics_stats.queryWebproperties(profileID);
    }

}(window.analytics_dom = window.analytics_dom || {}));