function sortDescJSON(data, key) {
	return data.sort(function (a, b) {
		var x = a[key];
		var y = b[key];
		return ((x > y) ? -1 : ((x < y) ? 1 : 0));
	});
};

function sortAscJSON(data, key) {
	return data.sort(function (a, b) {
		var x = a[key];
		var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
};

function readJSON(file) {
	var request = new XMLHttpRequest();
	request.open('GET', file, false);
	request.send(null);
	if (request.status == 200)
		return JSON.parse(request.responseText);
};

function organizeYearData(data, year) {
	var yr, response = [];
	$.each(data, function (i, v) {
		if (v.Year == year) {
			yr = v;
			return false;
		}
	});
	// TODO: include the region selector
	// get group
	var keys = Object.keys(yr.Hombres);
	for (j = 0; j < keys.length; j++) {
		var ky = keys[j];
		response.push({
			group: ky,
			male: yr.Hombres[ky],
			female: yr.Mujeres[ky]
		});
	}
	return response;
};

// some contrived data and set 2015 as the first
var json = sortDescJSON(readJSON("json/pob_choco.min.json"), "Year");
// Year to control the changes
var ari = 2015;
// SET UP DIMENSIONS
var w = 300, h = 200;

function drawGraph(year) {
	// Set year varibles
	ari = year;
	// document.getElementById("slider").value = ari;

	var exampleData = organizeYearData(json, year);
	// Set graph width according to the screen width
	if ($(window).width() <= 300) {
		w = $(window).width() - 100;
	} else {
		w = 300;
	}
	// margin.middle is distance from center line to each y-axis
	var margin = {
		top: 20,
		right: 20,
		bottom: 24,
		left: 20,
		middle: 28
	};

	// the width of each side of the chart
	var regionWidth = w / 2 - margin.middle;

	// these are the x-coordinates of the y-axes
	var pointA = regionWidth,
		pointB = w - regionWidth;

	// GET THE TOTAL POPULATION SIZE AND CREATE A FUNCTION FOR RETURNING THE PERCENTAGE

	var totalPopulation = d3.sum(exampleData, function (d) { return d.male + d.female; }),
		percentage = function (d) { return (d / totalPopulation).toPrecision(8); },
		formatPercent = d3.format(".0%");

	// CREATE SVG
	d3.select('#piramid').select("svg").remove();
	var svg = d3.select('#piramid').append('svg')
		.attr('width', margin.left + w + margin.right)
		.attr('height', margin.top + h + margin.bottom)
		// ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
		.append('g')
		.attr('transform', translation(margin.left, margin.top));

	// find the maximum data value on either side
	//  since this will be shared by both of the x-axes
	//var maxValue = Math.max(
	//d3.max(exampleData, function(d) { return percentage(d.male); }),
	//	d3.max(exampleData, function(d) { return percentage(d.female); })
	//);
	var maxValue = 0.07;
	// SET UP SCALES

	// the xScale goes from 0 to the width of a region
	//  it will be reversed for the left x-axis
	// var xScale = d3.scale.linear()
	var xScale = d3.scaleLinear()
		.domain([0, maxValue])
		.range([0, regionWidth])
		.nice();

	// var xScaleLeft = d3.scale.linear()
	var xScaleLeft = d3.scaleLinear()
		.domain([0, maxValue])
		.range([regionWidth, 0]);

	// var xScaleRight = d3.scale.linear()
	var xScaleRight = d3.scaleLinear()
		.domain([0, maxValue])
		.range([0, regionWidth]);

	// var yScale = d3.scale.ordinal()
	// var yScale = d3.scaleOrdinal()
	// 	.domain(exampleData.map(function (d) { console.log("d.group", d.group); return d.group; }))
	// .range([h, 0], 0.05);
	// .rangeRoundBands([h,0], 0.05);
	var yScale = d3.scaleBand()
		.domain(exampleData.map(function (d) { console.log("d.group", d.group); return d.group; }))
		.range([h, 0])
		.paddingInner(0.05);

	// SET UP AXES
	var yAxisLeft = d3.axisRight()
		.scale(yScale)
		.tickSize(4, 0)
		.tickPadding(margin.middle - 4);

	var yAxisRight = d3.axisLeft()
		.scale(yScale)
		.tickSize(4, 0)
		.tickFormat('');

	var xAxisRight = d3.axisBottom()
		.scale(xScale)
		.ticks(3)
		.tickFormat(formatPercent);

	var xAxisLeft = d3.axisBottom()
		// REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
		.scale(xScale.copy().range([pointA, 0]))
		.ticks(3)
		.tickFormat(formatPercent);

	// MAKE GROUPS FOR EACH SIDE OF CHART
	// scale(-1,1) is used to reverse the left side so the bars grow left instead of right
	var leftBarGroup = svg.append('g')
		.attr('transform', translation(pointA, 0) + 'scale(-1,1)');
	var rightBarGroup = svg.append('g')
		.attr('transform', translation(pointB, 0));

	// DRAW AXES
	svg.append('g')
		.attr('class', 'axis y left')
		.attr('transform', translation(pointA, 0))
		.call(yAxisLeft)
		.selectAll('text')
		.style('text-anchor', 'middle');

	svg.append('g')
		.attr('class', 'axis y right')
		.attr('transform', translation(pointB, 0))
		.call(yAxisRight);

	svg.append('g')
		.attr('class', 'axis x left')
		.attr('transform', translation(0, h))
		.call(xAxisLeft);

	svg.append('g')
		.attr('class', 'axis x right')
		.attr('transform', translation(pointB, h))
		.call(xAxisRight);

	console.log("exampleData", exampleData);
	// DRAW BARS
	leftBarGroup.selectAll('.bar.left')
		.data(exampleData)
		.enter().append('rect')
		.attr('class', 'bar left')
		.attr('x', 0)
		.attr('y', function (d) { return yScale(d.group); })
		.attr('width', function (d) { return xScale(percentage(d.male)); })
		.attr('height', yScale.bandwidth());

	leftBarGroup.selectAll("text")
		.attr('class', 'text_data')
		.data(exampleData)
		.enter()
		.append("text")
		.attr('x', function (d) { return -xScale(percentage(d.male)) - 28; })
		.attr('y', function (d) { return yScale(d.group) + yScale.bandwidth() / 2 + 5; })
		.text(function (d) { return d3.format(".2%")(percentage(d.male)) })
		.attr('style', 'font-size:10px;transform: scaleX(-1);-ms-transform:scaleX(-1);-moz-transform:scaleX(-1);-webkit-transform:scaleX(-1);-o-transform:scaleX(-1);');

	rightBarGroup.selectAll('.bar.right')
		.data(exampleData)
		.enter().append('rect')
		.attr('class', 'bar right')
		.attr('x', 0)
		.attr('y', function (d) { return yScale(d.group); })
		.attr('width', function (d) { return xScale(percentage(d.female)); })
		.attr('height', yScale.bandwidth());

	rightBarGroup.selectAll("text")
		.attr('class', 'text_data')
		.data(exampleData)
		.enter()
		.append("text")
		.attr('x', function (d) { return xScale(percentage(d.female)) + 5; })
		.attr('y', function (d) { return yScale(d.group) + yScale.bandwidth() / 2 + 5; })
		.text(function (d) { return d3.format(".2%")(percentage(d.female)) })
		.attr('style', 'font-size:10px;');;

	$("#ttl_year").text(year);

	svg.selectAll("text")
		.data(exampleData)
		.enter()
		.append("text")
		.text(function (d) {

		});

	// so sick of string concatenation for translations
	function translation(x, y) {
		return 'translate(' + x + ',' + y + ')';
	}
};

$(document).ready(function () {
	ari = 2015;
	drawGraph(ari);
	window.onresize = function () {
		drawGraph(ari);
	};
});
