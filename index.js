/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false
console.log('index.js');
const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
let subscriptionObject = false;
let tableArray = [];
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

function connectCallback() {
  document.getElementById('stomp-status').innerHTML = "It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs."
  getPrices();
}

function getPrices() {
  subscriptionObject = client.subscribe("/fx/prices", callback);
  console.log('jjj', subscriptionObject);
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
});

function callback(message) {
  // called when the client receives a STOMP message from the server
  //if(subscriptionObject) subscriptionObject.unsubscribe(subscriptionObject.id);
  const messageData = JSON.parse(message.body);
  if (messageData) {
    console.log(messageData);
    if(messageData.name) {
      const isExistNameIndex = tableArray.findIndex((data) => data.name === messageData.name);
      const midValue = Math.floor((messageData.bestBid + messageData.bestAsk)/2);
      if(isExistNameIndex > -1) {
        if(tableArray[isExistNameIndex].sparkLine.length > 30) {
          tableArray[isExistNameIndex].sparkLine = [];
          tableArray[isExistNameIndex].sparkLine.push(midValue);
        } else {
          tableArray[isExistNameIndex].sparkLine.push(midValue);
        }
        const sparkLine = tableArray[isExistNameIndex].sparkLine;
        tableArray[isExistNameIndex] = messageData;
        tableArray[isExistNameIndex].sparkLine = sparkLine;
      } else {
        messageData.sparkLine = [];
        messageData.sparkLine.push(midValue);
        tableArray.push(messageData);
      }
    }
    if(tableArray.length > 0) {
      tableArray = tableArray.sort((a, b) => (a.lastChangeBid > b.lastChangeBid) ? 1 : -1);
      const tbl = document.getElementById("stom-table");
      tbl.innerHTML = "";
      const tblBody = document.createElement("tbody");
      const header = tbl.createTHead();
      const headerRow = header.insertRow(0);
      const headerCell = document.createElement("th");
      headerCell.innerHTML = "Name";
      headerRow.appendChild(headerCell);
      const headerCell2 = document.createElement("th");
      headerCell2.innerHTML = "Best Bid";
      headerRow.appendChild(headerCell2);
      const headerCell3 = document.createElement("th");
      headerCell3.innerHTML = "Best Ask";
      headerRow.appendChild(headerCell3);
      const headerCell4 = document.createElement("th");
      headerCell4.innerHTML = "Last Change Bid";
      headerRow.appendChild(headerCell4);
      const headerCell5 = document.createElement("th");
      headerCell5.innerHTML = "Last Change Ask";
      headerRow.appendChild(headerCell5);
      const headerCell6 = document.createElement("th");
      headerCell6.innerHTML = "SparkLine";
      headerRow.appendChild(headerCell6);
      tableArray.forEach((data) => {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        const cell2 = document.createElement("td");
        const cell3 = document.createElement("td");
        const cell4 = document.createElement("td");
        const cell5 = document.createElement("td");
        const cell6 = document.createElement("td");
        cell.innerHTML = data.name;
        cell2.innerHTML = data.bestBid;
        cell3.innerHTML = data.bestAsk;
        cell4.innerHTML = data.lastChangeBid;
        cell5.innerHTML = data.lastChangeAsk;
        const sparklines = new Sparkline(cell6);
        sparklines.draw(data.sparkLine);
        row.appendChild(cell);
        row.appendChild(cell2);
        row.appendChild(cell3);
        row.appendChild(cell4);
        row.appendChild(cell5);
        row.appendChild(cell6);
        
        tblBody.appendChild(row);
      });
      tbl.appendChild(tblBody);
      /*setTimeout(()=> {
        getPrices();
      }, 5000);*/
    }
  } else {
    alert("got empty message");
  }
}


const exampleSparkline = document.getElementById('example-sparkline')
Sparkline.draw(exampleSparkline, [1, 2, 3, 6, 8, 20, 2, 2, 4, 2, 3])