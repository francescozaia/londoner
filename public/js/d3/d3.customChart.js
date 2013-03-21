;(function ( _d3, undefined ) {

    'use strict';

    var margin = {top: 40, right: 40, bottom: 40, left: 40},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var colorArray = [ "#BB9ECC"];
    var color = d3.scale.ordinal().range(colorArray);

    var lineWeight = "";

    var xScale = d3.time.scale().range([0, width]);
    var yScale = d3.scale.linear().range([height, 0]);

    var line = d3.svg.line()
        .interpolate("linear")
        //.interpolate("basis")
        //.interpolate("step-before")
        //.interpolate("linear")
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.temperature); });

    var _dataArray = [],
        _dimensionsArray = [],
        _metricsArray = [];

    var _selectedMetricsArray = [];

    var _dimensionsLength = 0;
    var _metricsLength = 0;


    function createVisitsChart(dataObjectTemp){
        

        /* creazione checkbox */
        var ulMetricsElement = $('<ul/>')
                .attr('id', 'metrics');
        /* ciclo tutte le metriche e ne creo dei checkbox*/
        for (var _m = 0; _m<dataObjectTemp.query.metrics.length; _m++) {
            var listItem = $('<li/>')
            .addClass('metricsItem')
            .appendTo(ulMetricsElement);

            var input = $('<input/>')
                .attr('id', dataObjectTemp.query.metrics[_m].toString()) 
                .attr('value', dataObjectTemp.query.metrics[_m].toString())
                .attr('name', 'lineedamostrare')
                .attr('type', 'checkbox')
                //.attr('checked', 'checked')
                .appendTo(listItem);
            
            var label = $('<label/>')
                .attr('for', dataObjectTemp.query.metrics[_m].toString())
                .text(dataObjectTemp.query.metrics[_m].toString())
                .appendTo(listItem);
        };
        ulMetricsElement.appendTo("#chart");
        //$( "#metrics" ).buttonset();

        
        $( "#metrics input[type=checkbox]" ).on( "click", function(event){
            _selectedMetricsArray= [];
            $.each($("#metrics input:checked"), function(el) {
                _selectedMetricsArray.push($("#metrics input:checked")[el].value);
            });
            briskies(dataObjectTemp);
        });

    }

    function briskies(dataObjectTemp){
        
        $('svg').remove();
        $('#selectable').remove();
        $('#minicolorsDiv').remove();

        /* START: CREAZIONE SELECT STILE */
        var interpolations = ["linear","step-before","basis", "cardinal"];

        var selectHtml = '<select class="target">'
        $.each( interpolations, function( index, value ) {
            selectHtml += '<option value="' + value + '">' + value + '</option>';
        });
        selectHtml += '</select>'

        $(selectHtml).appendTo("#chart");

        $(".target").change(function () {
            var index = this.value
                var modifiedWScale = d3.scale.ordinal().range([1, 1, 1]);
                var modifiedLine = d3.svg.line()
                    .interpolate(index)
                    .x(function(d) { return xScale(d.date); })
                    .y(function(d) { return yScale(d.temperature); });
                d3.selectAll(".line")
                    //.transition()
                    .attr("d", function(d) { return modifiedLine(d.values); })
                    .style("stroke-width", function(d) { return modifiedWScale(d.name); });

        }).change();

        /* END: CREAZIONE SELECT STILE */

        var svg = d3.select("#chart").append("svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        

        


        for (var i=0; i<dataObjectTemp.rows.length; i++) {
            var _rowObject = {};
            var _dimensionsObject = {};
            var _metricsObject = {};
            // dimensions (by now not selectable)
            for (var _dimension = 0; _dimension<_dimensionsLength; _dimension++) {
                var _dimensionName = dataObjectTemp.columnHeaders[_dimension].name.toString()
                _rowObject[_dimensionName] = dataObjectTemp.rows[i][_dimension].toString();
                _dimensionsObject[_dimensionName] = dataObjectTemp.rows[i][_dimension].toString();;
            }
            // metrics (choosen by _selectedMetricsArray)
            for (var _metric = _dimensionsLength; _metric<_metricsLength+_dimensionsLength; _metric++) {
                var _metricsName = dataObjectTemp.columnHeaders[_metric].name.toString();
                if(_selectedMetricsArray.indexOf(_metricsName) > -1){
                    _rowObject[_metricsName] = dataObjectTemp.rows[i][_metric].toString();
                    _metricsObject[_metricsName] = dataObjectTemp.rows[i][_metric].toString();
                }
            }

            _dataArray[i] = _rowObject;
            _dimensionsArray[i] = _dimensionsObject;
            _metricsArray[i] = _metricsObject;
        }

        /* unwanted: fa sì che cambino i colori sotto il culo al cambio delle metriche */
        color.domain(d3.keys(_metricsArray[0]));

        _dataArray.forEach(function(d) {
            // era d.date = ... per generalizzare metterlo solo per ga:date.
            d["ga:date"] = d3.time.format("%Y%m%d").parse(d["ga:date"]);
        });

        var _cities = color.domain().map(function(n) {
            return {
                name: n,
                values: _metricsArray.map(function(d){
                    return {
                        date: _dimensionsArray["ga:date"],
                        temperature: parseInt(d[n])
                    }
                })
            }; 
        });
        var cities = color.domain().map(function(name) {
            return {
                name: name,
                values: _dataArray.map(function(d) {
                    return {
                        date: d["ga:date"],
                        temperature: +d[name]
                    };
                })
            };
        });

        // X
        xScale.domain(d3.extent(_dataArray, function(d) { return d["ga:date"]; }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.svg.axis().scale(xScale).ticks(5).tickFormat(d3.time.format("%d/%m")).orient("bottom"))
            //.append("text")
            //.style("text-anchor", "end")
            //.text("Giorni");

        // Y
        yScale.domain([
            d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
            d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
        ]);

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.svg.axis().scale(yScale).orient("left"))
            //.attr("y", -10)
            //.append("text")
            //.style("text-anchor", "end")
            //.text("Valori");


        var city = svg.selectAll(".city")
            .data(cities)
            .enter().append("g")
            .attr("class", "city");


        var wScale = d3.scale.ordinal().range([1, 1, 1]);

        city.append("path")
            .attr("class", "line")
            .attr("id", function(d) { return d.name.replace("ga:","");})
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); })
            .style("stroke-width", function(d) { return wScale(d.name); });

        city.selectAll("circle")
            .data(_dataArray).enter()
            .append("circle")
            .style("opacity", 1)
            .style("fill", "#262626")
            .attr("stroke", "#BB9ECC") //colorArray
            .attr("stroke-width", "1")
            .attr("cx", function(d) {return xScale(d["ga:date"])})
            .attr("cy", function(d) {return yScale(d["ga:visits"])})
            .attr("r", 3)

            /*
        city.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.temperature) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });
*/
        onCreated(dataObjectTemp);
    };

    function valueLenght(v){
        if (typeof(v) === 'string') {
            return 1;
        }else {
            return v.length;
        }
    }

    function onCreated(dOT){
        
        /*
        var minicolorsDiv = $('<div id="minicolorsDiv"></div>').appendTo("#chart");

        minicolorsDiv.empty().colorPicker({
            clickCallback: function(c) {
                colorArray[0] = c;
                var color = d3.scale.ordinal().range(colorArray);
                d3.selectAll(".line").style("stroke", function(d) { return color(d.name); })
                
            }
        });
        */
        
    }

    _d3.initialize = function (dataObjectTemp) {
        _dimensionsLength = valueLenght(dataObjectTemp.query.dimensions);
        _metricsLength = valueLenght(dataObjectTemp.query.metrics);

        createVisitsChart(dataObjectTemp) 
    };

}(window.d3_customChart = window.d3_customChart || {}));