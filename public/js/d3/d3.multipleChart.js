;(function ( _d3, undefined ) {

    'use strict';

    var margin = {top: 10, right: 50, bottom: 150, left: 50},
		width = 800 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom,
		contextHeight = 20,
		contextWidth = width * .5,
		svg = null;

	var domainMin = 0; // the minimum of visits is zero
	var domainMax = 0; // i need to calculate it through the max between visits and new visits

    function createMultipleChart(dataObjectTemp) {
	    svg = d3.select("#chart")
	    	.append("svg")
	    	.attr("width", width + margin.left + margin.right)
	    	.attr("height", (height + margin.top + margin.bottom));
		
		var gaMetricsArray = [];
		var gaMetricsArrayLength = 0;
		
		var fiteredObjectsArray = [];
		var fiteredObjectsArrayLenght = 0;
		
		// creating a metrics title array
		$.each(dataObjectTemp.columnHeaders, function (index, value) {
			if (value.columnType == "METRIC") {
				gaMetricsArray.push(value.name);
			}
		});
		gaMetricsArrayLength = gaMetricsArray.length;
		var singleChartHeight = height / gaMetricsArrayLength; // height divided by the number of graphs to show

		// creating a []
		$.each(dataObjectTemp.rows, function (index, value) {
			var rowObjectTemp = {};
			rowObjectTemp[dataObjectTemp.columnHeaders[0].name.toString()] = d3.time.format("%Y%m%d").parse(value[0].toString()); //ga:date
	        rowObjectTemp[dataObjectTemp.columnHeaders[1].name.toString()] = value[1]; //ga:visits
	        rowObjectTemp[dataObjectTemp.columnHeaders[2].name.toString()] = value[2]; //ga:newVisits
	        //rowObjectTemp["ga:returningVisits"] = (value[1] - value[2]).toString();

	        domainMax = Math.max(parseInt(value[1]), parseInt(value[2]), domainMax); // need to improve performance?

	        //console.log(rowObjectTemp) // Object {ga:date: Thu Jan 31 2013 00:00:00..., ga:visits: "1", ga:newVisits: "1"}

	        fiteredObjectsArray.push(rowObjectTemp);
		});
		fiteredObjectsArrayLenght = fiteredObjectsArray.length;


		// chart creation();
		var charts = [];

		for(var i = 0; i < gaMetricsArrayLength; i++){
			var chart = new Chart({
				id: i,
				width: width,
				height: singleChartHeight,
				margin: margin,
				svg: svg,
				data: fiteredObjectsArray,
				currentMetric: gaMetricsArray[i],
				domainMax: domainMax
			});
			charts.push(chart);
		}

		var brush = new Brush({
			charts: charts,
			singleChartHeight: singleChartHeight,
			gaMetricsArrayLength: gaMetricsArrayLength
		});
		
	};

	function Brush(options) {
		var tickHeight = 5;

		var contextXScale = d3.time.scale()
			.range([0, contextWidth])
			.domain(options.charts[0].xScale.domain());	// note: si basa sul primo chart
			

		var contextAxis = d3.svg.axis()
			.scale(contextXScale)
			.tickSize(tickHeight)
			.tickFormat(d3.time.format("%d"))
			.orient("bottom");
		
		var contextArea = d3.svg.area()
			.x(function(d) { return contextXScale(d["ga:date"]); })
			.y0(contextHeight)
			.y1(0);

		var brush = d3.svg.brush()
			.x(contextXScale)
			.on("brush", onBrush);

		var context = svg.append("g")
			.attr("class","context")
			.attr("transform", "translate(" + (margin.left + width * .25) + "," + (height + margin.top + options.singleChartHeight) + ")");
		
		context.append("g")
			.attr("class", "x axis top")
			//.attr("transform", "translate(0,0)")
			.attr("transform", "translate(0," + parseInt(contextHeight) + ")")
			.call(contextAxis)
											
		context.append("g")
			.attr("class", "x brush")
			.call(brush)
			.selectAll("rect")
				.attr("y", 0)
				.attr("height", contextHeight);
		
		context.append("text")
			.attr("class","instructions")
			.attr("transform", "translate(0," + (contextHeight + tickHeight + 40) + ")")
			.text('Click and drag above to zoom / pan the data');
							
		function onBrush(){
			// this will return a date range to pass into the chart object 
			var b = brush.empty() ? contextXScale.domain() : brush.extent();
			for(var i = 0; i < options.gaMetricsArrayLength; i++){
				options.charts[i].showOnly(b);
			}
		}

	};
	

	function Chart(options) {

		this.chartData = options.data;
		this.width = options.width;
		this.height = options.height;
		this.svg = options.svg;
		this.id = options.id;
		this.margin = options.margin;

		var currentMetric = options.currentMetric;
		var readableCurrentMetric = currentMetric.replace("ga:","")

		/* XScale is time based on extent between minimum and maximum in ga:date */
		this.xScale = d3.time.scale()
				.range([0, this.width])
				.domain(d3.extent(this.chartData.map(function(d) { return d["ga:date"]; })));
		
		/* YScale is linear based on the domain we found earlier */
		this.yScale = d3.scale.linear()
				.range([this.height, 0])
				.domain([domainMin, domainMax]);
		var xS = this.xScale;
		var yS = this.yScale;
		

		this.area = d3.svg.area()
			.x(function(d) { return xS(d["ga:date"]); })
			.y0(this.height)
			.y1(function(d) { return yS(d[currentMetric]); });
		/*
			This isn't required - it simply creates a mask. If this wasn't here,
			when we zoom/panned, we'd see the chart go off to the left under the y-axis 
		
		this.svg.append("defs").append("clipPath")
				.attr("id", "clip-" + this.id)
				.append("rect")
					.attr("width", this.width)
					.attr("height", this.height);*/
		/*
			Assign it a class so we can assign a fill color
			And position it on the page
		*/
		var paddingVert = 15;
		this.chartContainer = svg.append("g")
			.attr('class', readableCurrentMetric)
			.attr("transform", "translate(" + this.margin.left + "," + (this.margin.top + (parseInt(this.height+5+paddingVert) * this.id) + (10 * this.id)) + ")");

		/* We've created everything, let's actually add it to the page */
		this.chartContainer.append("path")
			.data([this.chartData])
			.attr("class", "chart")
			.attr("clip-path", "url(#clip-" + this.id + ")")
			.attr("d", this.area);

		/* X axis */
		//this.xAxisBottom = d3.svg.axis().scale(this.xScale).orient("bottom").tickFormat(d3.time.format("%b %d"));
		this.xAxisBottom = d3.svg.axis().scale(this.xScale).orient("bottom").ticks(d3.time.weeks, 1).tickFormat(d3.time.format("%d/%m")).tickSubdivide(7)
		this.chartContainer.append("g")
			.attr("class", "x axis bottom")
			.attr("transform", "translate(0," + parseInt(this.height + 5) + ")")
			.call(this.xAxisBottom);
		
		/* Y axis */
		this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(5);
		this.chartContainer.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(-5,0)")
			.call(this.yAxis);
												
		this.chartContainer.append("text")
			.attr("class","country-title")
			.attr("transform", "translate(15,40)")
			.text(readableCurrentMetric);

		
		
	};
	Chart.prototype.showOnly = function(b) {
			this.xScale.domain(b);
			this.chartContainer.select("path").data([this.chartData]).attr("d", this.area);
			//this.chartContainer.select(".x.axis.top").call(this.xAxisTop);
			this.chartContainer.select(".x.axis.bottom").call(this.xAxisBottom);
		};

    _d3.initialize = function (dataObjectTemp) {
    	createMultipleChart(dataObjectTemp);
    };

}(window.d3_multipleChart = window.d3_multipleChart || {}));