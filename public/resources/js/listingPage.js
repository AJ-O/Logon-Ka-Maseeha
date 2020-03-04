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
console.log(_ngoName);

if (!_ngoHash) {
  document.querySelector("body").display = "none";
  alert(
    "You haven't loggin in as an NGO!\nPlease log in as an NGO and try again!"
  );
  window.location = "http://localhost:8181";
}

let count = 0;
let donateItemsEle = document.getElementById("donatedItems");
let unorderedListEle = document.createElement("ul");
unorderedListEle.style.listStyle = "none";

let loaded;

donateItemsEle.appendChild(unorderedListEle);
initializeStuff();

async function initializeStuff() {
  let options = {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    }
  };

  let response = await fetch("/request_fb_initialization", options);
  let json = await response.json();

  if (json.status == "success") {
    firebase.initializeApp(json.firebaseConfig);
    listingItems();
  } else {
    console.log("Error");
  }
}

function listingItems() {
  document.querySelector("#text").textContent = "";

  const db = firebase.database().ref("Donated_Items_List/");
  let loading = document.querySelector("#loading");
  loading.style.display = "flex";
  db.once("value", async snapshot => {
    let donatedItemsRef = snapshot.val();
    //console.log(dbRef);
    // for (item in dbRef) {
    //   console.log(dbRef[item]);
    // }
    // let users = Object.keys(dbRef);
    // for (user in users) {
    //   let donatedItemsRef = await snapshot
    //     .child(users[user] + "/DonatedItemList")
    //     .val();
    //   //console.log(donatedItemsRef);
    for (donatedItems in donatedItemsRef) {
      let imageSrc = donatedItemsRef[donatedItems]["data"]["imageUrl"];
      let pickupAddress =
        donatedItemsRef[donatedItems]["data"]["pickupAddress"];
      let productType = donatedItemsRef[donatedItems]["data"]["productType"];
      let status = donatedItemsRef[donatedItems]["data"]["status"];
      let date = donatedItemsRef[donatedItems]["data"]["date"];
      let mobile_no = donatedItemsRef[donatedItems]["data"]["mobile_no"];

      if (status == undefined) {
        status = "In queue";
      }

      // let randomBool = false; // this will decide when to display the no items message
      let toDisplay = true;
      if (status === "Awaiting Response") {
        createLiItem(
          imageSrc,
          pickupAddress,
          productType,
          status,
          date,
          mobile_no,
          donatedItems
        );
        // randomBool = true;
        toDisplay = false;
      } else {
        // if (randomBool) {
        if (toDisplay) {
          document.querySelector("#text").textContent =
            "No Additional Listings Available!";
          loading.style.display = "none";
          document.querySelector(".text").style.display = "flex";
          document.querySelector(".text").style.justifyContent = "center";
          document.querySelector(".text").style.alignItems = "center";
          document.querySelector("#text").style.fontSize = "50px";
          // }
        } else {
          toDisplay = true;
        }
      }
      count++;
      console.log(count);
      // loaded = true;
    }
    enableItemsPickUp();
    // }
  });
}

function createLiItem(src, add, type, status, date, mobile_no, donatedItems) {
  let liElement = document.createElement("li");
  console.log(date);
  liElement.setAttribute("id", date);

  let imageEle = document.createElement("img");
  imageEle.src = src;
  imageEle.width = 150;
  imageEle.height = 100;

  let pickupAddressEle = document.createElement("p");
  pickupAddressEle.textContent = add;

  let productTypeEle = document.createElement("p");
  productTypeEle.textContent = type;

  let statusEle = document.createElement("p");
  statusEle.textContent = status;

  let mobileEle = document.createElement("p");
  mobileEle.textContent = mobile_no;

  let divEle = document.createElement("div");
  divEle.setAttribute("id", "listItems");
  divEle.append(pickupAddressEle, productTypeEle, statusEle, mobileEle);

  let ngoPickUp = document.createElement("button");
  ngoPickUp.textContent = "Pick Up";
  ngoPickUp.setAttribute("id", donatedItems);
  ngoPickUp.setAttribute("class", "ngoPickUp");

  liElement.append(imageEle, divEle, ngoPickUp);
  // liElement.appendChild(ngoPickUp);
  unorderedListEle.prepend(liElement);

  loading.style.display = "none";
}

function enableItemsPickUp() {
  // console.log("Hello");
  let pickUps = document.getElementsByClassName("ngoPickUp");
  for (let i = 0; i < pickUps.length; i++) {
    // console.log(pickUps[i]);
    pickUps[i].addEventListener("click", () => {
      actuallyPickUp(pickUps[i].id);
    });
  }
}

async function actuallyPickUp(keyOfItem) {
  // console.log(idOfItem);
  const options = {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({ keyOfItem, _ngoHash, _ngoName })
  };

  let response = await fetch("/NGOPickingUp", options);
  let json = await response.json();

  if (json.status === "success") {
    location.reload();
  } else {
    alert("Some error occured. Please try later");
    location.reload();
  }
}
