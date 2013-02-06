;(function ( _analytics, undefined ) {

    'use strict';

    var $profilesElement;

    /**
     * Handles the API response for querying the accounts collection. This checks
     * to see if any error occurs as well as checks to make sure the user has
     * accounts. It then retrieve the ID of the first account and then executes
     * queryWebProeprties.
     * @param {Object} response The response object with data from the
     *     accounts collection.
     */
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

    /**
     * Executes a query to the Management API to retrieve all the users
     * webproperties for the provided accountId. Once complete,
     * handleWebproperties is executed.
     * @param {String} accountId The ID of the account from which to retrieve
     *     webproperties.
     * -----
     * Handles the API response for querying the webproperties collection. This
     * checks to see if any error occurs as well as checks to make sure the user
     * has webproperties. It then retrieve the ID of both the account and the
     * first webproperty, then executes queryProfiles.
     * @param {Object} response The response object with data from the
     *     webproperties collection.
     */
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


    /**
     * Executes a query to the Management API to retrieve all the users
     * profiles for the provided accountId and webPropertyId. Once complete,
     * handleProfiles is executed.
     * @param {String} accountId The ID of the account from which to retrieve
     *     profiles.
     * @param {String} webpropertyId The ID of the webproperty from which to
     *     retrieve profiles.
     * ---
    * Handles the API response for querying the profiles collection. This
     * checks to see if any error occurs as well as checks to make sure the user
     * has profiles. It then retrieve the ID of the first profile and
     * finally executes queryCoreReportingApi.
     * @param {Object} response The response object with data from the
     *     profiles collection.
     */
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


    /**
     * Execute a query to the Core Reporting API to retrieve the top 25
     * organic search terms by visits for the profile specified by profileId.
     * Once complete, handleCoreReportingResults is executed.
     * @param {String} profileId The profileId specifying which profile to query.
     * -----
    * Handles the API reponse for querying the Core Reporting API. This first
     * checks if any errors occured and prints the error messages to the screen.
     * If sucessful, the profile name, headers, result table are printed for the
     * user.
     * @param {Object} response The reponse returned from the Core Reporting API.
     */
    function queryCoreReportingApi(profileId) {
        utils.updatePage('Querying Core Reporting API with profileId: ' + profileId);
        var metrics = "";
        /*if ($("#visits").attr('checked') == "checked")
            metrics += ",ga:visits";
        if ($("#newVisits").attr('checked') == "checked")
            metrics += ",ga:newVisits";
        if (metrics.charAt(0) == ",")
            metrics = metrics.substr(1);*/
        var startDate = utils.lastDaysCount(100);
        var endDate = utils.lastDaysCount(1);
        metrics = "ga:visits,ga:newVisits";

        gapi.client.analytics.data.ga.get({
            'ids': 'ga:' + profileId,
            //'start-date': $("#from").val(),
            //'end-date': $("#to").val(),
            'start-date': startDate,
            'end-date': endDate,
            'metrics': metrics,
            'dimensions': 'ga:date',
            'sort': 'ga:date',
            'filters': 'ga:medium==organic',
        }).execute(function (response) {
            if (!response.code) {
                if (response.rows && response.rows.length) {
                    d3_multipleChart.initialize(response.result);
                    //d3_singleChart.initialize(response);
                    //d3_stackedChart.initialize(response);
                    //d3_visitsChart.initialize(response);
                } else {
                    utils.outputToPage('No results found.');
                }
            } else {
                utils.updatePage('There was an error querying core reporting API: ' + response.message);
            }
        });
    }

    /**
     * Executes a query to the Management API to retrieve all the users accounts.
     * Once complete, handleAccounts is executed.
     */
    _analytics.makeApiCall = function() {
        $profilesElement = $('<b>Querying Accounts...</b></span><div id="output"></div>').prependTo('.profile_panel');
        gapi.client.analytics.management.accounts.list().execute(handleAccounts);
    }

}(window.analytics_stats = window.analytics_stats || {}));