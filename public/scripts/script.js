"use strict"

// global vars
var allGraphs;

var categoriesDictionary;
var data;

var ping, pingWatch
var pingBalance = 0;


window.onload = () => {
    categoriesDictionary = getCategoriesDictionary();
    webSocketConnect(categoriesDictionary);
    themeToggle();
    loadTerminal();
}

function webSocketConnect() {
    let loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
        uri = "wss:";
    }
    uri += "//127.0.0.1:1111/ws";

    let ws = new WebSocket(uri);

    ping = setInterval(function() {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
            pingBalance++;
        }
    }, 2000);

    ws.onopen = function () {
        console.log("Connected");
    };

    ws.onmessage = function (evt) {
        if (evt.data === "pong") {
            pingBalance--;
            return
        }
        data = JSON.parse(evt.data)
        let t = new OutputTable("output", data, categoriesDictionary);
        t.createTable();
        allGraphs = drawGraphs(data, categoriesDictionary);
    };

    ws.onclose = function() {
        console.log("ws closed reload the page")
    }

    ws.onerror = function() {
        console.log("error connecting to the backend")
    }

    pingWatch = setInterval(pingPongServerWatch, 2000, ws)
}

function pingPongServerWatch(ws) {
    if (pingBalance > 2) { // more than a 4sec without a response from the server
        const message = "no connection to server, reload the page";
        console.warn(message);
        clearInterval(ping);
        clearInterval(pingWatch);
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }

        addErrorMessage(message);
        shadowInterface();
    }
}

function addErrorMessage(message) {
    document.querySelector(".error-messages").innerText += `${message}\n`
}

function shadowInterface() {
    document.querySelector("table#output").classList.add("shadow");
    let gg = document.querySelectorAll("#dashboard .graph");
    for (let g of gg) {
        g.classList.add("shadow");
    }
}

function getCategoriesDictionary() {
    let request = new XMLHttpRequest();
    request.open('GET', '/categories', false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
        return makeDictionary(JSON.parse(request.responseText))
    }
    console.error("error: no categories info received from the server");
    return null
}

function makeDictionary(json) {
    let categoriesDictionary = {}
    for(let j of json) {
        categoriesDictionary[j.ID] = {name: j.name, color: j.color}
    }
    return categoriesDictionary
}


function themeToggle() {
    let checkbox = document.querySelector('input#theme-toggle');

    checkbox.addEventListener('change', function() {
        if(this.checked) {
            setThemeDark();
        } else {
            setThemeLight();
        }
    })

    let setThemeDark = () => {
        document.documentElement.setAttribute('data-theme', 'dark')
        trans()

        // graphs
        for (let g of allGraphs) {
            if (g["colorsDark"]) {
                // update["marker.color"] = [g["colorsDark"]];
                Plotly.restyle(g.idSelector, "marker.color", [g["colorsDark"]]);
            }
        }
    }

    let setThemeLight = () => {
        document.documentElement.setAttribute('data-theme', 'light')
        trans()

        // graphs
        for (let g of allGraphs) {
            if (g["colorsLight"]) {
                // update[] = [g["colorsLight"]];
                Plotly.restyle(g.idSelector, "marker.color", [g["colorsLight"]]);
            }
        }
    }

    let trans = () => {
        document.documentElement.classList.add('transition');
        window.setTimeout(() => {
            document.documentElement.classList.remove('transition');
        }, 1000)
    }
}
