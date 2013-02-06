;(function ( _analytics, undefined ) {

    'use strict';

    _analytics.showError = function(string){
         utils.updatePage(string);
    };

    _analytics.createProfiles = function(response){
        //var ulAccountsElement = document.createElement("div"); 
        //ulAccountsElement.innerHTML = "profili associati all\'account email: <b>' + response.username + '</b>"; 


        var ulAccountsElement = $('<ul/>')
                .attr('id', 'accounts');

        $.each(response.items, function(i)
        {
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

        /* questo deve star qui? secondo me no */
        
    };


    _analytics.gotoWebProfiles = function(event){
        event.preventDefault();
        // moving into "/profile"
        var profileID = $(this).attr('data-profile');
        //History.pushState({state:3}, "Account", "account/" + profileID);
        $('.data_panel').show();
        $('.profile_panel').hide();
        window.analytics_stats.queryWebproperties(profileID);
    }

}(window.analytics_dom = window.analytics_dom || {}));