"use strict"

var ping, pingWatch
var pingBalance = 0;

window.onload = () => {
    let categoriesDictionary = getCategoriesDictionary();
    webSocketConnect(categoriesDictionary);
    themeToggle();
}

function webSocketConnect(categoriesDictionary) {
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
    }, 2000);

    ws.onopen = function () {
        console.log("Connected");
    };

    ws.onmessage = function (evt) {

        if (evt.data === "pong") {
            pingBalance--;
            return
        }

        let t = new OutputTable("output", JSON.parse(evt.data), categoriesDictionary);
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
    if (pingBalance > 2) { // more than a 4sec without a response from the server
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

function getCategoriesDictionary() {
    let request = new XMLHttpRequest();
    request.open('GET', '/categories', false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
        return makeDictionary(JSON.parse(request.responseText))
    }
    console.error("categories cannot be received from the server");
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
            trans()
            document.documentElement.setAttribute('data-theme', 'dark')
        } else {
            trans()
            document.documentElement.setAttribute('data-theme', 'light')
        }
    })

    let trans = () => {
        document.documentElement.classList.add('transition');
        window.setTimeout(() => {
            document.documentElement.classList.remove('transition');
        }, 1000)
    }
}
