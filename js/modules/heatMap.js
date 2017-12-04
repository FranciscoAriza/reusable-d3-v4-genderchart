/* global d3 */

function heatMap(selection) {
  var
    margin = { top: 150, right: 0, bottom: 50, left: 150 },
    width = 400 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 13),
    legendElementWidth = gridSize*1.85,
    buckets = 7,
    //colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    //colors = ["#edf8fb","#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#6e016b"]
    colors = ["#ffffcc","#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"]
    days = ["ARMA BLANCA","ARMA DE FUEGO","CONTUNDENTES","CORTANTES","ESCOPOLAMINA","JERINGA","PERRO","SIN EMPLEO DE ARMAS","NO REPORTADO"],
    times = ["A PIE","BICI","C-BUS","C-MOTO","C-TAXI","C-VEH","P-BUS","P-METRO","P-MOTO","P-TAXI","P-VEH","VEHICULO","NO REPORTA"],
    datasets = [],
    onMouseOver = function () { },
    onMouseOut = function () { };

  function chart(selection) {
    selection.each(function (data) {
      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var svgEnter = svg.enter().append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

      var gEnter = svgEnter.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the outer dimensions.
      svg.merge(svgEnter)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

      // Update the inner dimensions.
      var g = svg.merge(svgEnter).select("g")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const dayLabels = g.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
          .text(function (d) { return d; })
          .attr("x", 0)
          .attr("y", (d, i) => i * gridSize)
          .style("text-anchor", "end")
          .style("font-size", "10px")
          .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
          .attr("class", (d, i) => ((i >= 0 && i <= 9) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"));

      const timeLabels = g.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
          .text((d) => d)
          //.attr("x", (d, i) => i * gridSize)
          .attr("x", 5)
          .attr("y", (d, i) => (i * gridSize)+15)
          .style("text-anchor", "left")
          .style("font-size", "10px")
          .attr("transform", "translate(" + gridSize / 2 + ", -6)")
          .attr("transform", "rotate(-90)")
          .attr("class", (d, i) => ((i >= 0 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"));

      function extractArmaId(key) {
        var str = String(key);
        var armaID = str.split("|");
        return armaID[0];
      }
      function extractMovilId(key) {
        var str = String(key);
        var movilID = str.split("|");
        return movilID[1];
      }

      const heatmapChart = function(tsvFile) {
        const colorScale = d3.scaleQuantile()
          .domain([0, (d3.max(data, (d) => d.value) / 13) , d3.max(data, (d) => d.value)])
          .range(colors);

        const cards = g.selectAll(".hour")
            .data(data, (d) => extractArmaId(d.key)+':'+ extractMovilId(d.key));

        cards.append("title");

        cards.enter().append("rect")
            .attr("x", (d) => (extractMovilId(d.key) - 1) * gridSize)
            .attr("y", (d) => (extractArmaId(d.key) - 1) * gridSize)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", colors[0])
            .merge(cards)
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .transition()
            .duration(1000)
            .style("fill", (d) => colorScale(d.value));

        cards.select("title").text((d) => d.value);

        cards.exit().remove();

        const legend = g.selectAll(".legend")
            .data([0].concat(colorScale.quantiles()), (d) => d);

        const legend_g = legend.enter().append("g")
            .attr("class", "legend");

        // legend_g_rect = g.selectAll("rect")
        //     .data(data);
        legend_g.append("rect")
          .attr("x", (d, i) => legendElementWidth * i)
          .attr("y", height)
          .attr("width", legendElementWidth)
          .attr("height", gridSize / 2)
          .style("fill", (d, i) => colors[i]);

        // var legend_g_text = g.selectAll(".mono")
        //   .data(function (d) { return d; });

        legend_g.append("text")
          .attr("class", "mono")
          .text((d) => "≥ " + Math.round(d))
          .style("font-size", "10px")
          .attr("x", (d, i) => legendElementWidth * i)
          .attr("y", height + gridSize)
          //.attr("x", -250)
          //.attr("y", (d, i) => ( legendElementWidth* i) +25 );
          //.style("text-anchor", "right");
          //.attr("transform", "rotate(-90)");

        legend.exit().remove();
      };
      heatmapChart(datasets[0]);
    });
  }
  chart.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    innerWidth = width - margin.left - margin.right;
    return chart;
  };

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    innerHeight = height - margin.top - margin.bottom;
    return chart;
  };
  chart.days = function (_) {
    if (!arguments.length) return days;
    days = _;
    return chart;
  };
  chart.onMouseOver = function (_) {
    if (!arguments.length) return onMouseOver;
    onMouseOver = _;
    return chart;
  };
  chart.onMouseOut = function (_) {
    if (!arguments.length) return onMouseOut;
    onMouseOut = _;
    return chart;
  };
  return chart;
}
