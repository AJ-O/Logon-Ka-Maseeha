let count = 0;
let donateItemsEle = document.getElementById("donatedItems");
let unorderedListEle = document.createElement("ul");
unorderedListEle.style.listStyle = "none";

donateItemsEle.appendChild(unorderedListEle);

let firebaseConfig = {
  apiKey: "AIzaSyCFdFiuXfwk3jpIYUd44XKh0Hp14l63ZJE",
  authDomain: "logon-ka-maseeha.firebaseapp.com",
  databaseURL: "https://logon-ka-maseeha.firebaseio.com",
  storageBucket: "logon-ka-maseeha.appspot.com"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.database().ref("users/");
db.once("value", async snapshot => {
  let dbRef = snapshot.val();
  let users = Object.keys(dbRef);
  for (user in users) {
    let donatedItemsRef = await snapshot
      .child(users[user] + "/DonatedItemList")
      .val();
    //console.log(donatedItemsRef);
    for (donatedItems in donatedItemsRef) {
      let imageSrc = donatedItemsRef[donatedItems]["data"]["imageUrl"];
      let pickupAddress =
        donatedItemsRef[donatedItems]["data"]["pickupAddress"];
      let productType = donatedItemsRef[donatedItems]["data"]["productType"];
      let status = donatedItemsRef[donatedItems]["data"]["status"];
      if (status == undefined) {
        status = "In queue";
      }
      createLiItem(imageSrc, pickupAddress, productType, status);
      count++;
      console.log(count);
    }
  }
});

function createLiItem(src, add, type, status) {
  let liElement = document.createElement("li");
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
  unorderedListEle.appendChild(liElement);
}
