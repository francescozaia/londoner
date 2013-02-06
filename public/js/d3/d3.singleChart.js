;(function ( _d3, undefined ) {

    'use strict';

    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y%m%d").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    //var color = d3.scale.category20();
    var color = d3.scale.ordinal().range([ "#536E7D", "#1A3540", "#786056"]);

    var lineWeight = d3.scale.ordinal().range([ 1, 1, 10]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.temperature); });


    var line = d3.svg.line()
        .interpolate("")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temperature); });

    


    function createSingleChart(dataObjectTemp){

        var svg = d3.select("#chart").append("svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var data= [];
        for (var i=0; i<dataObjectTemp.rows.length; i++) {
            var rowObjectTemp = {};
            rowObjectTemp[dataObjectTemp.columnHeaders[0].name.toString()] = dataObjectTemp.rows[i][0].toString(); //ga:date
            rowObjectTemp[dataObjectTemp.columnHeaders[1].name.toString()] = dataObjectTemp.rows[i][1].toString(); //ga:visits
            rowObjectTemp[dataObjectTemp.columnHeaders[2].name.toString()] = dataObjectTemp.rows[i][2].toString(); //ga:newVisits
            rowObjectTemp["differenza"] = (dataObjectTemp.rows[i][1] - dataObjectTemp.rows[i][2]).toString();
            data.push(rowObjectTemp);
        }

        color.domain(d3.keys(data[0]).filter(function(key) {
            return key !== "ga:date";
        }));

        data.forEach(function(d) {
            d.date = parseDate(d["ga:date"]);
        });

        var cities = color.domain().map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {
                        date: d.date,
                        temperature: +d[name]
                    };
                })
            };
        });

        x.domain(d3.extent(data, function(d) { return d.date; }));

        y.domain([
            d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
            d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
        ]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Valori");

        var city = svg.selectAll(".city")
            .data(cities)
            .enter().append("g")
            .attr("class", "city");

        
                /*
        city.append("path")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("class", "area")
          .attr("d", area);
        */

        city.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); })
            .style("stroke-width", function(d) { return lineWeight(d.name); })
            .style("stroke-linecap", "round")
            .style("stroke-linejoin", "round");


        city.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

        city.selectAll("circle")
            .data(data).enter()
            .append("circle")
            .style("opacity", 0.2)
            .attr("cx", function(d) {return x(d.date)})
            .attr("cy", function(d) {return y(d["differenza"])})
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
                    .attr("x", x(d.date) + 10)
                    .attr("y", y(d["differenza"]) - 10)
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

        /* save as image (without css)
        var html = d3.select("svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

        d3.select("body").append("a")
            .attr("title", "file.svg")
            .attr("href-lang", "image/svg+xml")
            .attr("target", "_blank")
            .attr("href", "data:image/svg+xml;base64,\n" + btoa(html))
            .text("Download");
        */
    }

    _d3.initialize = function (dataObjectTemp) {
        createSingleChart(dataObjectTemp) 
    };

}(window.d3_singleChart = window.d3_singleChart || {}));