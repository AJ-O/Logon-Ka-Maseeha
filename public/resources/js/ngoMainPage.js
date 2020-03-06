// let loading = document.querySelector("#loading");
// loading.style.display = "flex";

let itemStatus = {};

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const _ngoHash = getCookie("ngoHash");
const _ngoName = getCookie("ngoName");
// console.log(_ngoHash);

if (!_ngoHash) {
  document.querySelector("body").display = "none";
  alert(
    "You haven't loggin in as an NGO!\nPlease log in as an NGO and try again!"
  );
  window.location = "http://localhost:8181";
}

async function displayItems() {
  let loading = document.querySelector("#loading");
  loading.style.display = "flex";

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ _ngoName, _ngoHash })
  };

  const response = await fetch("/displayItemsForNGO", options);
  const items = await response.json();

  let itemKeys = Object.keys(items);

  let itemPickedStatus = {
    label: "Items Picked",
    y: 0
  };

  let itemAcceptedStatus = {
    label: "Items Accpeted",
    y: 0
  };

  let itemDonatedStatus = {
    label: "Items Donated",
    y: 0
  };

  let totalItems = itemKeys.length;

  for (let i = 0; i < itemKeys.length; i++) {
    
    const date = items[itemKeys[i]].date;
    const imageURL = items[itemKeys[i]].imageUrl;
    const mobileNumber = items[itemKeys[i]].mobile_no;
    const address = items[itemKeys[i]].pickupAddress;
    const productType = items[itemKeys[i]].productType;
    const status = items[itemKeys[i]].status;
    const coords = items[itemKeys[i]].userCoordinates;
    const userName = items[itemKeys[i]].userName;

    if (status === "Accepted Item"){
      itemAcceptedStatus.y++;
    } else if (status === "Item Picked" || status === "Item Picked Up") {
      itemPickedStatus.y++;
    } else {
      itemDonatedStatus.y++;
    }

    createListItem(
      date,
      imageURL,
      mobileNumber,
      address,
      productType,
      status,
      coords,
      userName,
      itemKeys[i]
    );
  }

  itemAcceptedStatus.y = (itemAcceptedStatus.y / totalItems) * 100;
  itemDonatedStatus.y = (itemDonatedStatus.y / totalItems) * 100;
  itemPickedStatus.y =  (itemPickedStatus.y / totalItems) * 100;

  itemStatus.accepted = itemAcceptedStatus;
  itemStatus.picked = itemPickedStatus;
  itemStatus.donated = itemDonatedStatus;

  displayChart(itemStatus);

  const buttons = document.querySelectorAll(".changeStatus");
  buttons.forEach(ele => {
    ele.addEventListener("click", evt => {
      console.log("clicked");
      assignStatus(evt.target.id, evt.target.className.split(" ")[1], _ngoName);
    });
  });

  const ngoButtons = document.querySelectorAll("button");
  ngoButtons.forEach(ele => {
    console.log(ele.textContent);
    if (ele.textContent === "Everything Done") {
      ele.disabled = true;
    }
  });
}

function createListItem(
  date,
  imageURL,
  mobileNumber,
  address,
  productType,
  status,
  coords,
  userName,
  itemKey
) {
  let individual = document.createElement("li");
  individual.setAttribute("class", "individual-attribute");

  let dateEle = document.createElement("p");
  dateEle.textContent = "Date Uploaded: \t" + new Date(date);

  let imageURLEle = document.createElement("img");
  imageURLEle.src = imageURL;
  imageURLEle.style.width = "200px";
  imageURLEle.style.height = "200px";

  let mobileEle = document.createElement("p");
  mobileEle.textContent = "Mobile Number: \t" + mobileNumber;

  let addressEle = document.createElement("p");
  addressEle.textContent = "Address: \t" + address;

  let productTypeEle = document.createElement("p");
  productTypeEle.textContent = "Product Type: \t" + productType;

  let statusEle = document.createElement("p");
  statusEle.textContent = "Status: \t" + status;

  let coordsEle = document.createElement("p");
  coordsEle.textContent = "Co-Ordinates: \t" + coords.lat + ", " + coords.long;

  let userNameEle = document.createElement("p");
  userNameEle.textContent = "Uploaded By: \t" + userName;

  let collection = document.createElement("div");
  collection.setAttribute("class", "itemData");
  collection.append(
    dateEle,
    mobileEle,
    addressEle,
    productTypeEle,
    statusEle,
    coordsEle,
    userNameEle
  );

  let changeStatus = document.createElement("button");
  changeStatus.textContent = assignName(status);
  changeStatus.setAttribute(
    "class",
    "changeStatus " + status.replace(" ", ".")
  );
  changeStatus.setAttribute("id", itemKey);

  loading.style.display = "none";
  individual.append(imageURLEle, collection, changeStatus);

  document.querySelector("ul").appendChild(individual);
}

function signOutAsNGO() {
  document.cookie = "ngoHash= ; expires= Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "ngoName= ; expires= Thu, 01 Jan 1970 00:00:00 GMT";
  window.location = "http://localhost:8181";
}

document.querySelector("#goBack").addEventListener("click", signOutAsNGO);
displayItems();

document.querySelector("#ngo-name").textContent = _ngoName;

function assignName(status) {
  let textResponse = "";
  if (status === "Accepted Item") {
    textResponse = "Item Picked Up";
  } else if (status === "Item Picked Up" || status === "Item Picked") {
    textResponse = "Item Donated";
  } else if (status === "Item Donated") {
    textResponse = "Everything Done";
  } else {
    textResponse = status;
  }

  return textResponse;
}

async function assignStatus(itemKey, currentStatus, ngoName) {
  let newStatus = assignName(currentStatus.replace(".", " "));
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ itemKey, newStatus, ngoName })
  };

  const response = await fetch("/updateStatusNGOSide", options);
  const json = await response.json();

  console.log(json);
  if (json.status === "success") {
    location.reload();
  } else {
    alert("Oops! Something went wrong! Try again later!");
  }
}

function displayChart(itemStatus){
  let chart1 = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    backgroundColor: "transparent",
    title: {
      text: "Item Status"
    },
    data: [
      {
        type: "pie",
        startAngle: 240,
        yValueFormatString: '##0.00"%"',
        indexLabel: "{label} {y}",
        dataPoints: [
          { y: itemStatus.accepted.y, label: itemStatus.accepted.label },
          { y: itemStatus.picked.y, label: itemStatus.picked.label },
          { y: itemStatus.donated.y, label: itemStatus.donated.label }
        ]
      }
    ]
  });
  chart1.render();
}