"use strict"

console.log("script loaded")

window.onload = () => {
    webSocketConnect()
}

var tableObject

function webSocketConnect() {
    let loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
        uri = "wss:";
    }
    uri += "//127.0.0.1:1111/ws";

    let ws = new WebSocket(uri);

    ws.onopen = function () {
        console.log("Connected");
    };

    ws.onmessage = function (evt) {
        let out = document.getElementById("output");
        out.innerHTML = getTable(evt.data);
    };
}

function getTable(data) {
    let table = `<table><tr><th>categories</th><th>headline</th><th>image</th><th>location</th><th>date</th><th>severity</th></tr>`
    for (let d of JSON.parse(data)) {
        table += "<tr>"
        table += `<td>${d.categories}</td>`
        table += `<td>${d.headline}</td>`
        table += `<td>${d.image}</td>`
        table += `<td>${d.location}</td>`
        table += `<td>${d.publishDate}</td>`
        table += `<td>${d.severity}</td>`
        table += "</tr>"
    }
    table += "</table>"
    return table
}
