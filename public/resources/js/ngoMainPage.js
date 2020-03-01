// let loading = document.querySelector("#loading");
// loading.style.display = "flex";

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
  for (let i = 0; i < itemKeys.length; i++) {
    // console.log(items[itemKeys[i]]);
    const date = items[itemKeys[i]].date;
    const imageURL = items[itemKeys[i]].imageUrl;
    const mobileNumber = items[itemKeys[i]].mobile_no;
    const address = items[itemKeys[i]].pickupAddress;
    const productType = items[itemKeys[i]].productType;
    const status = items[itemKeys[i]].status;
    const coords = items[itemKeys[i]].userCoordinates;
    const userName = items[itemKeys[i]].userName;

    createListItem(
      date,
      imageURL,
      mobileNumber,
      address,
      productType,
      status,
      coords,
      userName
    );
  }
}

function createListItem(
  date,
  imageURL,
  mobileNumber,
  address,
  productType,
  status,
  coords,
  userName
) {
  let individual = document.createElement("li");

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
  coordsEle.textContent = "Co-ordinates: \t" + coords.lat + ", " + coords.long;

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
  loading.style.display = "none";

  individual.append(imageURLEle, collection);

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
