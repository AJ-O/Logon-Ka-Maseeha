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

      if (status == undefined) {
        status = "In queue";
      }
      createLiItem(imageSrc, pickupAddress, productType, status, date);
      count++;
      console.log(count);
    }
    // }
  });
}
function createLiItem(src, add, type, status, date) {
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

  let divEle = document.createElement("div");
  divEle.setAttribute("id", "listItems");
  divEle.append(pickupAddressEle, productTypeEle, statusEle);
  liElement.append(imageEle, divEle);
  unorderedListEle.prepend(liElement);
}
