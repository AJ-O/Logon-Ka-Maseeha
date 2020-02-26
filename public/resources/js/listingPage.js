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
// console.log(_ngoHash);

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
      createLiItem(
        imageSrc,
        pickupAddress,
        productType,
        status,
        date,
        mobile_no
      );
      count++;
      console.log(count);
    }
    // }
  });
}
function createLiItem(src, add, type, status, date, mobile_no) {
  let liElement = document.createElement("li");
  console.log(date);
  liElement.setAttribute("id", date);
  // liElement.style.display = "flex";
  // liElement.style.flexDirection = "column";

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
  divEle.append(pickupAddressEle, productTypeEle, statusEle);

  let ngoPickUp = document.createElement("button");
  ngoPickUp.textContent = "Pick Up";

  liElement.append(imageEle, divEle, ngoPickUp);
  // liElement.appendChild(ngoPickUp);
  unorderedListEle.prepend(liElement);

  loading.style.display = "none";
}
