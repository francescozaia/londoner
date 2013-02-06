;(function ( _utils, undefined ) {
    /**
     * Utility method to update the output section of the HTML page. Used
     * to output messages to the user. This overwrites any existing content
     * in the output area.
     * @param {String} output The HTML string to output.
     */
    _utils.outputToPage = function(output) {
        document.getElementById('output').innerHTML += output;
    }

    /**
     * Utility method to update the output section of the HTML page. Used
     * to output messages to the user. This appends content to any existing
     * content in the output area.
     * @param {String} output The HTML string to output.
     */
    _utils.updatePage = function(output) {
        document.getElementById('output').innerHTML += '<br>' + output;
    }

    _utils.lastDaysCount = function(n) {
        var today = new Date();
        var before = new Date();
        before.setDate(today.getDate() - n);

        var year = before.getFullYear();
        var month = before.getMonth() + 1;
        var day = before.getDate();
        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return [year, month, day].join('-');
    }

}(window.utils = window.utils || {}));