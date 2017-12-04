/* global d3, barChart, genderChart, scatterPlot*/

var sorterKey = {
    // "sunday": 0, // << if sunday is first day of week
    "lunes": 1,
    "martes": 2,
    "miércoles": 3,
    "jueves": 4,
    "viernes": 5,
    "sábado": 6,
    "domingo": 7,
    "enero": 8,
    "febrero": 9,
    "marzo": 10,
    "abril": 11,
    "mayo": 12,
    "junio": 13,
    "julio": 14,
    "agosto": 15,
    "septiembre": 16,
    "octubre": 17,
    "noviembre": 18,
    "diciembre": 19
}

var weekButtonControl = buttonControl()
    .width(400)
    .height(20)
    .x(function (d) { return d.key; });

var yearButtonControl = buttonControl()
    .width(400)
    .height(20)
    .x(function (d) { return d.key; });

var barrioBarChart = barChart()
    .width(400)
    .height(300)
    .x(function (d) { return d.key; })
    .y(function (d) { return +d.value; });

var armaBarChart = barChart()
    .width(300)
    .height(300)
    .x(function (d) { return d.key; })
    .y(function (d) { return +d.value; });

var myGenderChart = genderChart()
    .width(400)
    .height(300)
    .xLeft(function (d) { return +d.value; })
    .xRight(function (d) { return +d.value; })
    .y(function (d) { return d.key; });

var myRadialLineChart = radialLineChart()
    .width(300)
    .height(300)
    .x(function (d) { return d.key; })
    .y(function (d) { return d.value; })
    .modo(0);
// .modo(modo);

var myScatterPlot = scatterPlot()
    .width(500)
    .height(300)
    .x(function (d) { return d.Barrio2; })
    .y(function (d) { return +d["2016"]; });

var dateFmt = d3.timeParse("%Y/%m/%d %I:%M:%S %p");

function sortByKey(a, b) {
    var key1 = a.key.toLowerCase();
    var key2 = b.key.toLowerCase();
    return sorterKey[key1] > sorterKey[key2];
}
var myHeatMap = heatMap();
var myHeatMap2 = heatMap();

d3.tsv("data/Hurto celulares - Bogota_5.tsv",
    function (d) {
        // This function is applied to each row of the dataset
        d["TIMESTAMP"] = dateFmt(d["TIMESTAMP"]);
        return d;
    },
    function (err, data) {
        if (err) throw err;

        csData = crossfilter(data);
        all = csData.groupAll();

        csData.dimBarrio = csData.dimension(function (d) { return d["BARRIO_2"]; });
        csData.dimArma = csData.dimension(function (d) { return d["ARMA EMPLEADA"]; });
        // csData.dimMovilVictima = csData.dimension(function (d) { return d["MOVIL VICTIMA"]; });
        // csData.dimMovilAgresor = csData.dimension(function (d) { return d["MOVIL AGRESOR"]; });
        csData.dimArmaMovil = csData.dimension(function (d) { return d["ID_ARMA"] + '|' + d["ID_MOVIL"]})
        csData.dimRangoEtario = csData.dimension(function (d) { return d["RANGO_ETARIO"]; });
        // csData.dimGenero = csData.dimension(function (d) { return d["GENERO"]; });
        csData.dimTimestamp = csData.dimension(function (d) { return d["TIMESTAMP"]; });
        csData.dimYear = csData.dimension(function (d) { return d["TIMESTAMP"].getFullYear(); });
        csData.dimDia = csData.dimension(function (d) { return d["DIA"]; });

        // GENERO: [MASCULINO|FEMENINO]
        // bisectByFoo = crossfilter.bisect.by(function (d) { return d["GENERO"]; });

        csData.barrio = csData.dimBarrio.group();
        csData.arma = csData.dimArma.group();
        // csData.movilVictima = csData.dimMovilVictima.group();
        // csData.movilAgresor = csData.dimMovilAgresor.group();
        csData.ArmaMovil = csData.dimArmaMovil.group();
        csData.rangoEtario = csData.dimRangoEtario.group();
        csData.timestampMonth = csData.dimTimestamp.group(d3.timeMonth);
        csData.timestampWeek = csData.dimTimestamp.group(d3.timeWeek);
        csData.timestampDay = csData.dimTimestamp.group(d3.timeDay);
        csData.year = csData.dimYear.group();
        csData.dia = csData.dimDia.group();

        barrioBarChart.onMouseOver(function (d) {
            csData.dimBarrio.filter(d.key);
            update();
        });
        barrioBarChart.onMouseOut(function (d) {
            csData.dimBarrio.filterAll();
            update();
        });

        armaBarChart.onMouseOver(function (d) {
            csData.dimArma.filter(d.key);
            update();
        });
        armaBarChart.onMouseOut(function (d) {
            csData.dimArma.filterAll();
            update();
        });

        myGenderChart.onMouseOver(function (d) {
            csData.dimRangoEtario.filter(d.key);
            update();
        });
        myGenderChart.onMouseOut(function (d) {
            csData.dimRangoEtario.filterAll();
            update();
        });

        weekButtonControl.onMouseOver(function (d) {
            csData.dimDia.filter(d.key);
            update();
        });
        weekButtonControl.onMouseOut(function (d) {
            csData.dimDia.filterAll();
            update();
        });

        yearButtonControl.onMouseOver(function (d) {
            csData.dimYear.filter(d.key);
            // csData.dimTimestamp.filter(d.key.getFullYear());
            update();
        });
        yearButtonControl.onMouseOut(function (d) {
            csData.dimYear.filterAll();
            update();
        });
        myHeatMap.onMouseOver(function (d) {
            csData.dimArmaMovil.filter(d.key);
            update();
        });
        myHeatMap.onMouseOut(function (d) {
            csData.dimArmaMovil.filterAll();
            update();
        });

        function update() {
            d3.select("#weekButtons")
                .datum(csData.dia.all().sort(function (a, b) { return sortByKey(a, b); }))
                .call(weekButtonControl);

            d3.select("#yearButtons")
                .datum(csData.year.all())
                .call(yearButtonControl);

            d3.select("#barrioBarChart")
                .datum(csData.barrio.top(20))
                .call(barrioBarChart)
                .select(".x.axis")
                .selectAll(".tick text")
                .attr("transform", "rotate(-90) translate(-10, -13)");

            d3.select("#armaBarChart")
                .datum(csData.arma.top(Infinity))
                .call(armaBarChart)
                .select(".x.axis")
                .selectAll(".tick text")
                .attr("transform", "rotate(-90) translate(-10, -13)");

            d3.select("#gender")
                .datum(csData.rangoEtario.all())
                .call(myGenderChart);

            d3.select("#mesRadialLinechart")
                .datum(csData.timestampMonth.all())
                .call(myRadialLineChart);
            d3.select("#semanaRadialLinechart")
                .datum(csData.timestampWeek.all())
                .call(myRadialLineChart);
            d3.select("#diaRadialLinechart")
                .datum(csData.timestampDay.all())
                .call(myRadialLineChart);
            d3.select("#heatmapArmaMovilchart")
              .datum(csData.ArmaMovil.all())
              .call(myHeatMap);
        }

        update();
        // d3.select("#chart2")
        //     .datum(data.slice(0, 200))
        //     .call(myScatterPlot);

        // setTimeout(function () {
        //     d3.select("#chart")
        //         .datum(data.slice(0, 20))
        //         .call(barrioBarChart);
        // }, 8000);
    });

// d3.tsv("data/Hurto celulares - Edad.tsv",
//     function (d) {
//         d.FEMENINO = +d.FEMENINO;
//         d.MASCULINO = +d.MASCULINO;
//         return d;
//     },
//     function (err, data) {
//         if (err) throw err;

//         d3.select("#gender")
//             .datum(data)
//             .call(myGenderChart);
//     });
