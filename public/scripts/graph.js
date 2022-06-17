"use strict";

const alert1 = "#31A351",
    alert2 = "#78F09A",
    alert3 = "#FFE8E8",
    alert4 = "#F07878",
    alert5 = "#FF1212";

const alert1d = "#59A331",
    alert2d = "#A2F078",
    alert3d = "#FFE8FF",
    alert4d = "#E378F0",
    alert5d = "#FF77FF";


function drawGraphs(parsedData, categoryDictionary) {
    let categories = calcCategoryData(parsedData, categoryDictionary);
    let severity = calcSeverityData(parsedData);
    debugger;
    let isDark = document.documentElement.dataset.theme === "dark";

    let dataHist = [{
        x: severity.labels, // critical warning informational
        y: severity.values,
        type: 'bar'
    }];
    drawHist(dataHist, isDark);

    let dataPie = [{
        automargin: true,
        labels: categories.labels,
        marker: {
            colors: categories.colors,
        },
        textinfo: "label+percent",
        textposition: "outside",
        type: "pie",
        values: categories.values,
    }];
    drawPie(dataPie, isDark);

    // drawMap()
}
function calcCategoryData(parsedData, categoryDictionary){
    const colors = [];
    const labels = [];
    const values  = [];

    const parsed = {};

    for (let d of parsedData) {
        if (!d.categories) {
            continue;
        }
        for (let c of d.categories) {
            if (parsed[c.categoryId]) {
                parsed[c.categoryId] += 1;
                continue;
            }
            parsed[c.categoryId] = 1;
        }
    }

    for (const [key, value] of Object.entries(parsed)) {
        let color = categoryDictionary[key].color;
        color = color[0] === "#" ? color : "#" + color;
        colors.push(color)
        labels.push(categoryDictionary[key].name)
        values.push(value)
    }

    return {colors: colors, labels: labels, values: values};
}

function calcSeverityData(parsedData){
    const labels = ['low (1)', 'moderate (2)', 'average (3)', 'high (4)', 'extreme (5)'];
    const values = [0,0,0,0,0];
    for (let d of parsedData) {
        if (!d.severity) {
            continue;
        }
        values[d.severity-1] += 1;
    }

    return {labels: labels, values: values};
}

function drawHist(data, itDarkTheme=false) {
    let colors;
    let layout_hist = {
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        title: 'severity distribution'

    }
    if (itDarkTheme) {
        colors = [alert1d, alert2d, alert3d, alert4d, alert5d]
        layout_hist.color = "#fff";
        layout_hist.font = {color : "#fff"};
    } else {
        colors = [alert1, alert2, alert3, alert4, alert5]
        layout_hist.color = "#000";
        layout_hist.font = {color : "#000"};
    }

    data[0].marker = {
        color: colors,
    };
    Plotly.newPlot('severity-hist', data, layout_hist);
}


//pie
function drawPie(data, itDarkTheme=false) {
    let layout_pie = {
        height: 400,
        margin: {"t": 55, "b": 55, "l": 20, "r": 20},
        showlegend: false,
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        title: "categories distribution",
        width: 400,
    }
    if (itDarkTheme) {
        layout_pie.color = "#fff";
        layout_pie.font = {color : "#fff"};
    } else {
        layout_pie.color = "#000";
        layout_pie.font.font = {color : "#000"};
    }

    Plotly.newPlot('category-pie', data, layout_pie)
}


// map
function drawMap() {
    var url = "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson";

    d3.json(url, (err, raw) => {
        var lon = raw.features.map(f => f.geometry.coordinates[0]);
        var lat = raw.features.map(f => f.geometry.coordinates[1]);
        var z = raw.features.map(f => f.properties.mag);

        var data_map = [
            { type: "scattermapbox", lon: lon, lat: lat, z: z, hoverinfo: "y" }
        ];

        var layout_map = {
            mapbox: { style: "dark", zoom: 2, center: { lon: -150, lat: 60 } },
            margin: { t: 0, b: 0 }
        };

        var config_map = {
            mapboxAccessToken: "your access token"
        };

        Plotly.newPlot('locality-map', data_map, layout_map, config_map);
    });
}





