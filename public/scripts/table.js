// abstract class
class Table {
    constructor(tableContainerId, dataObject) {
        if (new.target === Table) {
            throw new TypeError("Cannot construct Abstract instances directly");
        }
        this.isOutputTable = true;

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
        headerConfig && headerConfig.filter(h => { return h.show || h.show === undefined }).forEach(hc => {
            let cell = row.insertCell(cellId++);
            cell.innerHTML = hc.headerCapture + (hc.sortingAsc !== undefined ? (hc.sortingAsc ? " ^" : " v") : "");

            // add sorting event
            if (!hc.noSotring) {
                let that = this;
                cell.addEventListener('click', () => {
                    headerConfig.forEach(el => {
                        if (el.backendKey !== hc.backendKey) {
                            el.sortingAsc = undefined;
                        }
                    });
                    if (hc.sortingAsc === null) { // if wasn't set in the configuration
                        hc.sortingAsc = true;
                    }
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
        if (search.value !== "") {
            for (let data of this.dataObject) {
                let dataTextual = JSON.stringify(Object.values(data)).replace(/[\"\[\]]/g, "").replace("false", "").replace("true", "");
                data.show = dataTextual.indexOf(search.value) !== -1;
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
        this.dataObject = sortObjectByFieldName(this.dataObject, backendKey, sortingAsc);
        this.createTable();
    }

    refreshBody() {
        this.table.getElementsByTagName("tbody")[0].remove();
        this.addBody();
    }
}

class OutputTable extends Table {
    constructor(tableContainerId, dataObjectFromServer) {
        super(tableContainerId, dataObjectFromServer);
        this.tableConfig = tableConfig; // global configuration object
    }

    addRow(body, rowData) {
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

        // const dispatchCallbackFunction = function(rowData) {
        //     return function() {
        //         ajax.dispatchDetail(areaLinked, rowData);
        //     }
        // }(rowData);

        if (this.tableConfig.idRequested) {
            cell = row.insertCell(cellId++);
            cell.innerHTML = row.rowIndex;
        }

        for (let hc of headerConfig.filter(h => { return h.show || h.show === undefined })) {
            // add cell from the backend
            cell = row.insertCell(cellId++);

            if (hc.isCategory) {
                let categories = rowData[hc.backendKey];
                if (!categories) {
                    continue;
                }

                for (let cat of categories) {
                    cell.innerHTML += `<span class="category" style="background-color: ${categoriesDictionary[cat.categoryId].color}">${categoriesDictionary[cat.categoryId].name}</span>`;
                }

                continue;
            }

            if (hc.isImage) {
                let imgUrl = rowData[hc.backendKey];
                if (!imgUrl) {
                    cell.innerHTML = "no image"
                    continue;
                }
                cell.innerHTML = `<img src='${imgUrl}' alt='' class="rounded" style='width:40px; height:40px;'>`;
                continue;
            }

            if (hc.isDate) {
                try {
                    let d = new Date(rowData[hc.backendKey]);
                    cell.innerHTML = `<span class="date">${d.getDate()}.${padNumber(d.getMonth() + 1)}.${d.getFullYear()}</span>` +
                        `<span class="time">${padNumber(d.getHours())}:${padNumber(d.getMinutes())}:${padNumber(d.getSeconds())}</span>`;
                } catch (e) {
                    console.warn("cannot parse date", e);
                    cell.innerHTML = rowData[hc.backendKey];
                }
                continue;
            }

            if (hc.isLink) {
                let link = rowData[hc.backendKey];
                if (!link) {
                    cell.innerHTML = "<span class='no-link'>no link</span>"
                    continue;
                }
                cell.innerHTML = `<a href='https://${link}' target='_blank'>link</a>`;
                continue;
            }

            // add configuration button
            // in this if we will add all the cells that will not riderect the page
            // if (hc.configurationButton) {
            //     let configureBotton = document.createElement('a');
            //     configureBotton.innerHTML = "<img src='etc/img/edit.png' type='botton' onclick='configurationModal()' alt='configure link' style='width:20px; height:20px;'>";
            //     cell.appendChild(configureBotton);
            //     continue;
            // }

            cell.innerHTML = rowData[hc.backendKey];

            // if (rowData.ID !== undefined && !this.tableConfig.noRiderect) {
            //     cell.addEventListener("click", dispatchCallbackFunction, true);
            // }
        }
    }

}

function sortObjectByFieldName(objectFromServer, backendKey, ascSorting) {
    if (ascSorting) {

        return objectFromServer.sort((a, b) => (a[backendKey] > b[backendKey]) ? 1 : ((b[backendKey] > a[backendKey]) ? -1 : 0))
    }
    return objectFromServer.sort((a, b) => (a[backendKey] < b[backendKey]) ? 1 : ((b[backendKey] < a[backendKey]) ? -1 : 0))
}

var tableConfig = {
    headers: [
        {
            backendKey: "categories",
            headerCapture: "Categories",
            sortingAsc: null,
            isCategory: true
        },
        {
            backendKey: "link",
            headerCapture: "URL",
            sortingAsc: null,
            noSorting: true,
            isLink: true
        },
        {
            backendKey: "headline",
            headerCapture: "Headline",
            sortingAsc: null
        },
        {
            backendKey: "image",
            headerCapture: "Image",
            sortingAsc: null,
            isImage: true,
            noSorting: true
        },
        {
            backendKey: "location",
            headerCapture: "Location",
            sortingAsc: null
        },
        {
            backendKey: "publishDate",
            headerCapture: "Date",
            sortingAsc: null,
            isDate: true
        },
        {
            backendKey: "severity",
            headerCapture: "Severity",
            sortingAsc: null,
        },
    ],
}

function padNumber(number) {
    return String(number).padStart(2, '0')
}
