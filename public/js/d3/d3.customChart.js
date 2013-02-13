;(function ( _d3, undefined ) {

    'use strict';

    var margin = {top: 20, right: 100, bottom: 20, left: 20},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var colorArray = [ "#536E7D", "#1A3540", "#786056"];
    var color = d3.scale.ordinal().range(colorArray);

    var lineWeight = "";

    var xScale = d3.time.scale().range([0, width]);
    var yScale = d3.scale.linear().range([height, 0]);

    var line = d3.svg.line()
        .interpolate("cardinal")
        //.interpolate("basis")
        //.interpolate("step-before")
        //.interpolate("linear")
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.temperature); });

    


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
        $( "#metrics" ).buttonset();

        
        $( "#metrics input[type=checkbox]" ).on( "click", function(event){
            var arrayDiMetricheDaMostrare = [];
            $.each($("#metrics input:checked"), function(el) {
                arrayDiMetricheDaMostrare.push($("#metrics input:checked")[el].value);
            });
            briskies(dataObjectTemp, arrayDiMetricheDaMostrare);
        });

    }

    function briskies(dataObjectTemp, arrayDiValoriDaMostrarePar){
        
        $('svg').remove();

        var svg = d3.select("#chart").append("svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var _dataArray = [],
            _dimensionsArray = [],
            _metricsArray = [];

        var _dimensionsLength = valueLenght(dataObjectTemp.query.dimensions);
        var _metricsLength = valueLenght(dataObjectTemp.query.metrics);


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
            // metrics (choosen by arrayDiValoriDaMostrarePar)
            for (var _metric = _dimensionsLength; _metric<_metricsLength+_dimensionsLength; _metric++) {
                var _metricsName = dataObjectTemp.columnHeaders[_metric].name.toString();
                if(arrayDiValoriDaMostrarePar.indexOf(_metricsName) > -1){
                    _rowObject[_metricsName] = dataObjectTemp.rows[i][_metric].toString();
                    _metricsObject[_metricsName] = dataObjectTemp.rows[i][_metric].toString();
                }
            }

            _dataArray[i] = _rowObject;
            _dimensionsArray[i] = _dimensionsObject;
            _metricsArray[i] = _metricsObject;


            /*_dimensions.push(dataObjectTemp.rows[i][0].toString());
            _metrics.push(_rowObject);*/
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

        
        $('#selectable').remove();
        $('#minicolorsDiv').remove();

        xScale.domain(d3.extent(_dataArray, function(d) { return d["ga:date"]; }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.svg.axis().scale(xScale).orient("bottom"))
            .append("text")
            .style("text-anchor", "end")
            .text("Giorni");

        // Y

        yScale.domain([
            d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
            d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
        ]);

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.svg.axis().scale(yScale).orient("left"))
            .attr("y", -10)
            .append("text")
            .style("text-anchor", "end")
            .text("Valori");

        

        var city = svg.selectAll(".city")
            .data(cities)
            .enter().append("g")
            .attr("class", "city");


        var wScale = d3.scale.ordinal().range([1,1,1,1,1]);

        city.append("path")
            .attr("class", "line")
            .attr("id", function(d) { return d.name.replace("ga:","");})
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); })
            .style("stroke-width", function(d) { return wScale(d.name); })
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round");


        city.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.temperature) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });
        /*
        city.selectAll("circle")
            .data(data).enter()
            .append("circle")
            .style("opacity", 0.2)
            .attr("cx", function(d) {return xScale(d.date)})
            .attr("cy", function(d) {return yScale(d["differenza"])})
            .attr("r", 0);

        city.selectAll("circle")
            .on("mouseover", function(d){
                d3.select(this)
                .transition()
                .style("opacity", 1)
                .attr("r", 8);
            })
            .on("mouseout", function(d){
                d3.select(this)
                .transition()
                .style("opacity", 0.2)
                .attr("r", 4);
            });
        
        city.selectAll("circle")
            .on("mouseover.tooltip", function(d){
                d3.select("text#as" + d["differenza"].toString()).remove(); // da sistemare "text#as" + d["ga:pageviews"].toString() perché se ce n'è più d'uno uguale muore
                d3.select(".city")
                    .append("text")
                    .text("returns: " + d["differenza"].toString())
                    .attr("x", xScale(d.date) + 10)
                    .attr("y", yScale(d["differenza"]) - 10)
                    .attr("id", "as" + d["differenza"].toString());
            });
        
        city.selectAll("circle")
            .on("mouseout.tooltip", function(d){
            d3.select("text#as" + d["differenza"].toString())
                .transition()
                .duration(500)
                .style("opacity", 0)
                .attr("transform","translate(10, -10)")
                .remove();
        });
        
        var enter_duration = 1000;
        city.selectAll("circle")
            .transition()
            .delay(function(d, i) { return i / data.length * enter_duration; })
            .attr("r", 4);
        */
        onCreated();
    };

    function valueLenght(v){
        if (typeof(v) === 'string') {
            return 1;
        }else {
            return v.length;
        }
    }

    function onCreated(){
    var interpolations = ["linear","step-before","basis", "cardinal"];
        var link = $('<ol id="selectable"><li class="ui-widget-content ui-selected">linear</li><li class="ui-widget-content">step-before</li><li class="ui-widget-content">basis-open</li><li class="ui-widget-content">cardinal-open</li></ol>').appendTo("#chart");
        $( "#selectable" ).selectable({
            stop: function() {
                $( ".ui-selected", this ).each(function() {
                    var index = $( "#selectable li" ).index( this );
                    var modifiedWScale = d3.scale.ordinal().range([ 2, 2, 2]);
                    var modifiedLine = d3.svg.line()
                        .interpolate(interpolations[index])
                        .x(function(d) { return xScale(d.date); })
                        .y(function(d) { return yScale(d.temperature); });
                    d3.selectAll(".line")
                        //.transition()
                        .attr("d", function(d) { return modifiedLine(d.values); })
                        .style("stroke-width", function(d) { return modifiedWScale(d.name); });
                });
            }
        });
        var minicolorsDiv = $('<div id="minicolorsDiv"></div>').appendTo("#chart");
        var inputMinicolors1 = $('<input id="visits" class="minicolors"></input>').appendTo("#minicolorsDiv");
        var inputMinicolors2 = $('<input id="newVisits" class="minicolors"></input>').appendTo("#minicolorsDiv");
        var inputMinicolors3 = $('<input id="differenza" class="minicolors"></input>').appendTo("#minicolorsDiv");
        
        //rifattorizzare (c'è anche l'ID della .line volendo)
        $('input#visits').minicolors({
            control: 'saturation',
            defaultValue: colorArray[0],
            textfield: false,
            position: 'top',
            hide: function() {
                colorArray[0] = this[0].value;
                var color = d3.scale.ordinal().range(colorArray);
                d3.selectAll(".line")
                    .style("stroke", function(d) { return color(d.name); })
            }
        });
        $('input#newVisits').minicolors({
            defaultValue: colorArray[1],
            control: 'saturation',
            textfield: false,
            position: 'top',
            hide: function() {
                colorArray[1] = this[0].value;
                var color = d3.scale.ordinal().range(colorArray);
                d3.selectAll(".line")
                    .style("stroke", function(d) { return color(d.name); })
            }
        });
        $('input#differenza').minicolors({
            defaultValue: colorArray[2],
            control: 'saturation',
            textfield: false,
            position: 'top',
            hide: function() {
                colorArray[2] = this[0].value;
                var color = d3.scale.ordinal().range(colorArray);
                d3.selectAll(".line")
                    .style("stroke", function(d) { return color(d.name); })
            }
        });
        
    }

    _d3.initialize = function (dataObjectTemp) {
        createVisitsChart(dataObjectTemp) 
    };

}(window.d3_customChart = window.d3_customChart || {}));