;(function ( _d3, undefined ) {

    'use strict';
    
    var n, // number of layers
        m; // number of samples per layer

    var margin = {top: 40, right: 10, bottom: 20, left: 10},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
       

    function createStackedChart(dataObjectTemp) {
        var stats = [];
        var charts = [];
        var maxDataPoint = 0;
        
        

        /* creo oggetti per essere mappati con la funzione map */
        var briskiesVisits = [];

        n = 2;
        m = dataObjectTemp.rows.length;
        var stack = d3.layout.stack();
        var l = d3.range(n);

        $.each(dataObjectTemp.rows, function (index, value) {
            var obj = {};
            obj["x"] = value[0].toString();
            obj["y"] = value[1].toString();
            briskiesVisits.push(obj);
        });

        var briskiesNewVisits = [];
        $.each(dataObjectTemp.rows, function (index, value) {
            var obj = {};
            obj["x"] = value[0].toString();
            obj["y"] = value[2].toString();
            briskiesNewVisits.push(obj);
        });

        var briskiesObject = [];
        briskiesObject.push(briskiesVisits);
        briskiesObject.push(briskiesNewVisits);

        console.log(briskiesObject);

        var mapping = l.map(function(d) { return briskiesObject[d]; });
        /*var mapping = dataObjectTemp.rows.map(function(d) {
            return {
                x: d[1],
                y: d[2]
            };
        });*/
        var layers = stack(mapping),
            yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
            yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

        
        var x = d3.scale.ordinal()
            .domain(d3.range(m))
            .rangeRoundBands([0, width], .08);

        var y = d3.scale.linear()
            .domain([0, yStackMax])
            .range([height, 0]);

        var color = d3.scale.linear()
            .domain([0, n - 1])
            .range(["#F90", "#F00"]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(0)
            .tickPadding(6)
            .orient("bottom");

         var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var layer = svg.selectAll(".layer")
            .data(layers)
          .enter().append("g")
            .attr("class", "layer")
            .style("fill", function(d, i) { return color(i); });

        var rect = layer.selectAll("rect")
            .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.x); })
            .attr("y", height)
            .attr("width", x.rangeBand())
            .attr("height", 0);

        rect.transition()
            .delay(function(d, i) { return i * 10; })
            .attr("y", function(d) { return y(d.y0 + d.y); })
            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        d3.selectAll("input").on("change", function change() {
          if (this.value === "grouped") transitionGrouped(x,y,rect,yGroupMax);
          else transitionStacked(x,y,rect,yStackMax);
        });
    }

    function transitionGrouped(x,y,rect,yGroupMax) {
        y.domain([0, yGroupMax]);
        rect.transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
          .attr("width", x.rangeBand() / n)
        .transition()
          .attr("y", function(d) { return y(d.y); })
          .attr("height", function(d) { return height - y(d.y); });
    }

    function transitionStacked(x,y,rect,yStackMax) {
      y.domain([0, yStackMax]);

      rect.transition()
          .duration(500)
          .delay(function(d, i) { return i * 10; })
          .attr("y", function(d) { return y(d.y0 + d.y); })
          .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
        .transition()
          .attr("x", function(d) { return x(d.x); })
          .attr("width", x.rangeBand());
    }

    _d3.initialize = function (s) {
        $('<form><label><input type="radio" name="mode" value="grouped"> Grouped</label><label><input type="radio" name="mode" value="stacked" checked> Stacked</label></form>').appendTo('#chart');
        createStackedChart(s);
    };

}(window.d3_stackedChart = window.d3_stackedChart || {}));