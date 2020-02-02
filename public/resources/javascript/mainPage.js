//Program Flow
// --  As window is loaded, items are to be displayed
// --  Get the username from the url
// --  Send the request to get Data from the server
// --  Listen to donate item button, onclick user will fill the form
// --  After user clicks donate button, data will be sent to server and saved
// --  When user submits, that data will be updated on the statusBoard

//To do:
// --  Give user prompt that data is being uploaded to the database -- Done
// -- Have a statusbar that will display that item is being loaded! -- Done
// -- Styling statusBar
// -- Use maps to get user location
// -- Send NGO's data that item is donated according to their location
// -- Lock  the item selected by NGO
// -- Sharing details between user and NGO

window.onload = displayItems();
let url = new URL(window.location);
let username = url.searchParams.get("username");
userSignedIn(username);

function intializeBaseStuff() {
  return new Promise((resolve, reject) => {
    let firebaseConfig = {
      apiKey: "AIzaSyCFdFiuXfwk3jpIYUd44XKh0Hp14l63ZJE",
      authDomain: "logon-ka-maseeha.firebaseapp.com",
      databaseURL: "https://logon-ka-maseeha.firebaseio.com",
      storageBucket: "logon-ka-maseeha.appspot.com"
    };
    firebase.initializeApp(firebaseConfig);
    resolve("success");
  });
}

const db = firebase.database();
let latestDonatedItemId = "";

async function userSignedIn(username) {
  let response = await fetch(`/:${username}`);
  let json = await response.json();

  if (json.status === "Success") {
    let divDB = document.getElementById("dashboard");
    if (divDB) {
      console.log("Got db");
    } else {
      console.log("Nope, didn't get db!");
    }
    let userElement = document.createElement("p");
    userElement.textContent = username;
    divDB.appendChild(userElement);
  } else {
    console.log("Error");
    alert("Error occured try again in some time");
    window.location = "localhost:8181";
  }
}

let donateButton = document.getElementById("donateItem");
let form = document.getElementById("donationForm");
let donate = document.getElementById("finalDonate");
let statusBoard = document.getElementById("statusBoard");
let unorderedList = document.createElement("ul");
let statusBarDiv = document.getElementById("statusBar");
let myBar = document.getElementById("myBar");
let coordButton = document.getElementById("getCoords");
coordButton.addEventListener("click", getCoordinates);
let uploadStatusBar = 0;
let userCoordinates = {};
let allowedLocationAccess = false;

unorderedList.style.listStyleType = "none";
donateButton.addEventListener("click", showForm);
donate.addEventListener("click", getData);

function showForm() {
  form.style.display = "block";
  donate.style.display = "block";
  myBar.style.display = "block";
}

function getCoordinates() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, error);
    allowedLocationAccess = true;
  } else {
    alert("Can't get position");
  }
}

function onSuccess(position) {
  console.log(position.coords.latitude);
  console.log(position.coords.longitude);
  let lat = position.coords.latitude;
  let long = position.coords.longitude;
  userCoordinates.lat = lat;
  userCoordinates.long = long;
}

function error(err) {
  console.log(err);
}

async function getData() {
  let blobDataResult;
  let reader = new FileReader();
  let fileObj = document.getElementById("filename").files[0];
  if (!allowedLocationAccess) {
    alert("Please allow location access to continue donation");
  } else {
    console.log(userCoordinates);
    let productType = document.getElementById("product").value;
    //let pickupAddress = document.getElementById("address").value;
    // let pickupAddressLat = userCoordinates.lat;
    // let pickupAddressLong = userCoordinates.lat;

    reader.onload = async function() {
      blobDataResult = reader.result;
      console.log(blobDataResult);
      uploadStatusBar = 20;
      uploadStatusBoard(
        productType,
        //pickupAddress,
        blobDataResult,
        userCoordinates
      );
      uploadStatusBarFunc();

      alert("Wait till item is donated!");
      let storageRef = firebase.storage().ref();
      let imageRef = storageRef.child(fileObj.name);

      let userImageRef = await imageRef.putString(blobDataResult, "data_url");
      uploadStatusBar = 45;
      uploadStatusBarFunc();

      if (userImageRef.state == "success") {
        let imageUrl = await userImageRef.ref.getDownloadURL();
        uploadStatusBar = 75;
        uploadStatusBarFunc();

        let retObj = {
          productType: productType,
          //pickupAddress: pickupAddress,
          userCoordinates: userCoordinates,
          userName: username,
          imageUrl: imageUrl
        };

        let option = {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(retObj)
        };
        let response = await fetch("/donateItem", option);
        let json = await response.json();

        if (json.status == "success") {
          uploadStatusBar = 100;
          uploadStatusBarFunc();
          console.log(json["autoKey"]);
          alert("Data uploaded");
        }
      } else {
        console.log("Try again");
        alert("Error uploading image, please try again!");
      }
    };
  }
  reader.onerror = function() {
    console.log(reader.error);
  };
  //reader.readAsArrayBuffer(fileObj);
  reader.readAsDataURL(fileObj);
}

async function uploadStatusBoard(p1, p2, iu, co) {
  let item = createListItem(p1, p2, iu, co);
  unorderedList.prepend(item);
  statusBoard.appendChild(unorderedList);
}

function createListItem(ptype, imageUrl, coo) {
  //pickupadd, imageUrl, coo) {
  let imageEle = document.createElement("img");
  imageEle.src = imageUrl;
  imageEle.width = 100;
  imageEle.height = 100;

  // let paraAddEle = document.createElement("p");
  // paraAddEle.textContent = pickupadd;

  let paraProEle = document.createElement("p");
  paraProEle.textContent = ptype;

  let latElement = document.createElement("p");
  latElement.textContent = coo.lat;

  let longElement = document.createElement("p");
  longElement.textContent = coo.long;

  let listItem = document.createElement("li");
  // let divEle = document.createElement("div");
  let brItem = document.createElement("br");
  listItem.appendChild(imageEle);
  paraProEle.style.display = "flex";
  paraProEle.style.flexDirection = "column";
  listItem.appendChild(paraProEle);
  // listItem.appendChild(brItem);
  //listItem.appendChild(paraAddEle);
  listItem.appendChild(latElement);
  listItem.appendChild(longElement);
  return listItem;
}

async function displayItems() {
  let status = await intializeBaseStuff();
  console.log(status);
  if (status == "success") {
    console.log("called!");
    let dbRef = db.ref("users/" + username);
    dbRef.once("value", async function(snapshot) {
      let donatedItemList = await snapshot.child("DonatedItemList").val(); //Get the values under donated item list

      for (item in donatedItemList) {
        //Replace with the required field
        let ptype = donatedItemList[item]["data"]["productType"];
        let imageUrl = donatedItemList[item]["data"]["imageUrl"];
        //let pickupadd = donatedItemList[item]["data"]["pickupAddress"];
        let userLocation = donatedItemList[item]["data"]["userCoordinates"];
        latestDonatedItemId = item;
        let documentItem = createListItem(
          ptype,
          //pickupadd,
          imageUrl,
          userLocation
        );
        unorderedList.prepend(documentItem);
      }
      statusBoard.appendChild(unorderedList);
    });
  } else {
    alert("Error loading firebase data!");
  }
}

function uploadStatusBarFunc() {
  myBar.style.width = uploadStatusBar + "%";
  myBar.textContent = uploadStatusBar + "%";
}
