;(function ( _analytics, undefined ) {

    'use strict';

    var $profilesElement;

    function handleAccounts(response) {
        if (!response.code) {
            if (response && response.items && response.items.length) {
                window.analytics_dom.createProfiles(response);
            } else {
                window.analytics_dom.showError('No accounts found for this user.');
            }
        } else {
            window.analytics_dom.showError('There was an error querying accounts: ' + response.message);
        }
    }

    _analytics.queryWebproperties = function(accountId) {
        utils.updatePage('Querying Webproperties with accountId: ' + accountId);
        gapi.client.analytics.management.webproperties.list({
            'accountId': accountId
        }).execute(function (response) {
            if (!response.code) {
                if (response && response.items && response.items.length) {
                    //perché usa la prima?
                    /*for (var i=0; i<response.items.length; i++) {
                        utils.updatePage(': ' + response.items[i].accountId + ' - ' + response.items[i].id + ' - ' + response.items[i].name );
                    }*/
                    var firstAccountId = response.items[0].accountId;
                    
                    for (var i=0; i<response.items.length; i++) {
                        //ri-perché usa la prima?
                        var firstWebpropertyId = response.items[i].id;
                        queryProfiles(firstAccountId, firstWebpropertyId);
                    }
                } else {
                    utils.updatePage('No webproperties found for this user.')
                }
            } else {
                utils.updatePage('There was an error querying webproperties: ' + response.message);
            }
        });
    }

    function queryProfiles(accountId, webpropertyId) {
        utils.updatePage('Querying Profiles with accountId: ' + accountId + ' and webpropertyId: ' + webpropertyId);
        gapi.client.analytics.management.profiles.list({
            'accountId': accountId,
            'webPropertyId': webpropertyId
        }).execute(function (response) {
            if (!response.code) {
                if (response && response.items && response.items.length) {
                    var firstProfileId = response.items[0].id;
                    queryCoreReportingApi(firstProfileId);
                } else {
                    utils.updatePage('No profiles found for this user.')
                }
            } else {
                utils.updatePage('There was an error querying profiles: ' + response.message);
            }
        });
    }

    function queryCoreReportingApi(profileId) {
        utils.updatePage('Querying Core Reporting API with profileId: ' + profileId);
        /*if ($("#visits").attr('checked') == "checked")
            metrics += ",ga:visits";
        if ($("#newVisits").attr('checked') == "checked")
            metrics += ",ga:newVisits";
        if (metrics.charAt(0) == ",")
            metrics = metrics.substr(1);*/
        var startDate = utils.lastDaysCount(30);
        var endDate = utils.lastDaysCount(1);
        var metrics = "ga:visits,ga:newVisits,ga:percentNewVisits,ga:timeOnSite,ga:uniquePageviews";
        var dimensions = "ga:date,ga:visitorType";
        var sortBy = "ga:date";

        gapi.client.analytics.data.ga.get({
            'ids': 'ga:' + profileId,
            //'start-date': $("#from").val(),
            //'end-date': $("#to").val(),
            'start-date': startDate,
            'end-date': endDate,
            'metrics': metrics,
            'dimensions': dimensions,
            'sort': sortBy,
            'filters': 'ga:medium==organic',
        }).execute(function (response) {
            if (!response.code) {
                if (response.rows && response.rows.length) {
                    //d3_multipleChart.initialize(response.result);
                    //d3_singleChart.initialize(response);
                    //d3_stackedChart.initialize(response);
                    //d3_visitsChart.initialize(response);
                    d3_customChart.initialize(response);
                } else {
                    alert('No results found.');
                }
            } else {
                alert('There was an error querying core reporting API: ' + response.message);
            }
        });
    }

    _analytics.makeApiCall = function() {
        $profilesElement = $('<b>Querying Accounts...</b></span><div id="output"></div>').prependTo('.profile_panel');
        gapi.client.analytics.management.accounts.list().execute(handleAccounts);
    }

}(window.analytics_stats = window.analytics_stats || {}));