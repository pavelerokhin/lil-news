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
    let isDark = document.documentElement.dataset.theme === "dark";

    let dataHist = [{
        x: severity.labels, // critical warning informational
        y: severity.values,
        type: 'bar'
    }];
    let hist = drawHist("severity-hist", dataHist, isDark);

    let dataPie = [{
        automargin: true,
        labels: categories.labels,
        textinfo: "label+percent",
        textposition: "outside",
        type: "pie",
        values: categories.values,
    }];
    let pie = drawPie("category-pie", dataPie, categories, isDark);

    // drawMap()

    return [hist, pie]
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

function drawHist(idSelector, data, itDarkTheme=false) {
    const colorsLight = [alert1, alert2, alert3, alert4, alert5],
          colorsDark = [alert1d, alert2d, alert3d, alert4d, alert5d];
    let layout_hist = {
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        title: 'severity distribution'

    }
    if (itDarkTheme) {
        layout_hist.color = "#fff";
        layout_hist.font = {color : "#fff"};
        data[0].marker = {
            color: colorsDark,
        };
    } else {
        layout_hist.color = "#000";
        layout_hist.font = {color : "#000"};
        data[0].marker = {
            color: colorsLight,
        };
    }
    let p = Plotly.newPlot(idSelector, data, layout_hist, {displaylogo: false});
    p["colorsDark"] = colorsDark;
    p["colorsLight"] = colorsLight;
    p.idSelector = idSelector;

    return p;
}


//pie
function drawPie(idSelector, data, categories, itDarkTheme=false) {
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

    data[0].marker = {
        colors: categories.colors,
    };
    let p = Plotly.newPlot(idSelector, data, layout_pie, {displaylogo: false})
    p.idSelector = idSelector;

    return p;
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





