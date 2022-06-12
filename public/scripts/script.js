"use strict"

console.log("script loaded")

window.onload = () => {
    webSocketConnect()
}

var ping, pingWatch
var pingBalance = 0;

function webSocketConnect() {
    let loc = window.location;
    let uri = "ws:";

    if (loc.protocol === "https:") {
        uri = "wss:";
    }
    uri += "//127.0.0.1:1111/ws";

    let ws = new WebSocket(uri);

    ping = setInterval(function() {
        ws.send('ping');
        pingBalance++;
    }, 5000);

    ws.onopen = function () {
        console.log("Connected");
    };

    ws.onmessage = function (evt) {

        if (evt.data === "pong") {
            pingBalance--;
            return
        }

        let t = new OutputTable("output", JSON.parse(evt.data));
        t.createTable();
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
    if (pingBalance > 2) { // more than a 10sec without a response from the server
        const message = "no connection to server, reload the page";
        console.warn(message);
        clearInterval(ping);
        clearInterval(pingWatch);
        ws.close();

        addErrorMessage(message);
        shadowTable();
    }
}

function addErrorMessage(message) {
    document.querySelector(".error-messages").innerText += `${message}\n`
}

function shadowTable() {
    document.querySelector("table#output").classList.add("shadow");
}
