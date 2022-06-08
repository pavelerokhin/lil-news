// abstract class
class Table {
    constructor(tableContainerId, dataObject) {
        if (new.target === Table) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.isOutputTable = true;

        // TODO: make dataObject an separate class
        if (new.target === OutputTable) {
            if (Array.isArray(dataObject)) {
                this.dataObject = dataObject;
            } else {
                this.dataObject = [dataObject];
            }
        } else {
            this.dataObject = dataObject;
        }
        this.tableConfig = null;
        this.tableContainerId = tableContainerId;
        this.table = document.getElementById(this.tableContainerId);
    }


    // creates the table body
    addBody() {
        let body = this.table.createTBody();

        if (this.dataObject && this.dataObject.length) {
            for (let d of this.dataObject) {
                this.addRow(body, d);
            }
        }
    }

    // creates table header
    addHeader() {
        let headerConfig = null;
        if (this.isOutputTable) {
            headerConfig = this.tableConfig.headers;
        }

        let header = this.table.createTHead();
        let row = header.insertRow();

        let cellId = 0;
        // insert the id cell if requested
        if (this.tableConfig.idRequested) {
            let cell = row.insertCell(cellId++);
            cell.innerHTML = "#";
        }

        //inserting cells from tableConfig
        headerConfig.filter(h => { return h.show || h.show == undefined }).forEach(hc => {
            let cell = row.insertCell(cellId++);
            cell.innerHTML = hc.headerCapture + (hc.sortingAsc != undefined ? (hc.sortingAsc ? " ^" : " v") : "");

            // TODO: make it function
            // add sorting event
            if (!hc.noSotring) {
                let that = this;
                cell.addEventListener('click', () => {
                    headerConfig.forEach(el => {
                        if (el.backendKey != hc.backendKey) {
                            el.sortingAsc = undefined;
                        }
                    });
                    if (hc.sortingAsc == undefined) {
                        hc.sortingAsc = true;
                    }
                    // TODO: see if this.tableContainer.id can be stortcutted by this.tableContainerId
                    that.sortTableBodyByBackendKey(hc.backendKey, hc.sortingAsc);
                    hc.sortingAsc = !hc.sortingAsc;
                });
            }
        });
    }

    addRow() {
        throw new TypeError("ERROR. The type of table has to be specified, add Row is an abstract method and has to be overwitten.");
    }

    appendToSearch() {
        let search = document.getElementById("table-search");
        // if search field exists, we band it to the table
        if (!search) {
            return;
        }
        search.onkeyup = ""; // hack
        let that = this;
        search.addEventListener("keyup",
            function() {
                that.searchFilter(search);
            });
    }

    createTable() {
        this.deleteTable();
        this.addHeader();
        this.addBody();
        this.appendToSearch();
    }

    deleteTable() {
        this.table && (this.table.innerHTML = "");
    }

    searchFilter(search) {
        debugger;
        if (search.value != "") {
            for (let data of this.dataObject) {
                let dataTextualize = JSON.stringify(Object.values(data)).replace(/[\"\[\]]/g, "").replace("false", "").replace("true", "");
                data.show = dataTextualize.indexOf(search.value) !== -1;
            }
        } else {
            for (let data of this.dataObject) {
                data.show = true;
            }
        }
        this.refreshBody();
    }

    sortTableBodyByBackendKey(backendKey, sortingAsc) {
        this.deleteTable();
        this.dataObject.data = sortOnjectByFieldName(this.dataObject.data, backendKey, sortingAsc);
        this.createTable();
    }

    refreshBody() {
        debugger;
        this.table.getElementsByTagName("tbody")[0].remove();
        this.addBody();
    }

}

class InputTable extends Table {
    constructor(tableContainerId, dataObject) {
        super(tableContainerId, dataObject);
        this.tableConfig = tableConfig;
    }

    addRow(body, rowData) {
        const headerConfig = this.tableConfig.headers;

        let cellId = 0;
        let row = body.insertRow();

        if (!rowData) {
            return;
        }

        if (rowData.errorHighlighted) {
            row.classList.add("error_row");
        }

        let that = this;
        for (let hc of headerConfig.filter(h => { return h.show || h.show == undefined })) {
            let cell = row.insertCell(cellId++);
            if (hc.deleteButton) {
                let idToDelete = rowData._id;
                cell.innerHTML = "&#10754;";
                cell.classList.add("delete-button");
                cell.addEventListener("click", function() {
                    that.dataObject = that.dataObject.filter(d => { return d._id != idToDelete });
                    that.refreshBody();
                });
                continue;
            }
            cell.innerHTML = getValueToInsert(rowData, hc.backendKey, hc.isToHumanize);
        }
    }
}

class OutputTable extends Table {
    constructor(tableContainerId, dataObjectFromServer) {
        super(tableContainerId, dataObjectFromServer);
        // TODO: if it is an output table we take this config   
        this.tableConfig = tableConfig; // global configuration object
    }

    addRow(body, rowData) {
        let areaLinked = this.tableConfig.areaLinked;
        const headerConfig = this.tableConfig.headers;

        let cellId = 0;
        let row = body.insertRow();
        let cell;

        if (!rowData) {
            return;
        }

        if (rowData.show !== undefined && !rowData.show) {
            return;
        }

        const dispatchCallbackFunction = function(rowData) {
            return function() {
                ajax.dispatchDetail(areaLinked, rowData);
            }
        }(rowData);

        if (this.tableConfig.idRequested) {
            cell = row.insertCell(cellId++);
            cell.innerHTML = row.rowIndex;
        }

        for (let hc of headerConfig.filter(h => { return h.show || h.show === undefined })) {
            // add cell from backend
            cell = row.insertCell(cellId++);

            // add configuration button
            // in this if we will add all the cells that will not riderect the page
            // if (hc.configurationButton) {
            //     let configureBotton = document.createElement('a');
            //     configureBotton.innerHTML = "<img src='etc/img/edit.png' type='botton' onclick='configurationModal()' alt='configure link' style='width:20px; height:20px;'>";
            //     cell.appendChild(configureBotton);
            //     continue;
            // }

            cell.innerHTML = getValueToInsert(rowData, hc.backendKey, hc.isToHumanize);

            if (rowData.ID !== undefined && !this.tableConfig.noRiderect) {
                cell.addEventListener("click", dispatchCallbackFunction, true);
            }
        }
    }

}

// static utility functions
function getValueToInsert(rowData, backendKey, isTohumaniseFileSize) {
    dataToInsert = rowData[backendKey];
    if (dataToInsert !== undefined && isTohumaniseFileSize) {
        return utils.humaniseFileSize(dataToInsert);
    }
    return dataToInsert;
}

function sortOnjectByFieldName(objectFromServer, backendKey, ascSorting) {
    if (ascSorting) {

        return objectFromServer.sort((a, b) => (a[backendKey] > b[backendKey]) ? 1 : ((b[backendKey] > a[backendKey]) ? -1 : 0))
    }
    return objectFromServer.sort((a, b) => (a[backendKey] < b[backendKey]) ? 1 : ((b[backendKey] < a[backendKey]) ? -1 : 0))
}

var tableConfig = {
    headers: [{
            backendKey: "categories",
            headerCapture: "Categories",
            sortingAsc: null
        },
        {
            backendKey: "headline",
            headerCapture: "Headline",
            sortingAsc: null
        },
        {
            backendKey: "image",
            headerCapture: "Image",
            sortingAsc: null
        },
        {
            backendKey: "location",
            headerCapture: "Location",
            sortingAsc: null
        },
        {
            backendKey: "publishDate",
            headerCapture: "Date",
            sortingAsc: null
        },
        {
            backendKey: "severity",
            headerCapture: "Severity",
            sortingAsc: null,
        },
    ],
}
