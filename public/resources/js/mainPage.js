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
// -- Use maps to get user location -- Done
// -- Send NGO's data that item is donated according to their location
// -- Lock the item selected by NGO
// -- Sharing details between user and NGO
// -- Assign key in realtime [on client side] -- Done but using id, try if another way possible!
// -- Show item is deleted in realtime [on client side] -- done but using reloading!
// -- Change status when ngo accepts
// -- drop down list -- Done
// -- phone number:
// --4 try for displaying used mobile numbers
// -- status of items
// -- cookie deletion
getCookie()
  .then(data => {
    console.log(data[0], data[1]);
    portNo = data[1];
    if (data[0] == "''") {
      alert("You haven't signed in\nKindly sign in");
      window.location = "http://localhost:8181";
    } else {
      domusername = data[0];
      userSignedIn(data[0]);
    }
  })
  .catch(error => {
    console.log(error);
    // alert("You haven't signed in\nKindly sign in");
    // window.location = "http://localhost:8181";
  });
// let url = new URL(window.location);
// let username = url.searchParams.get("username");
// let token = url.searchParams.get("token");
// if (token == null) {
//   console.log("wrong credentials");
// } else {
//   userSignedIn(username, token);
// }

function getCookie() {
  return new Promise(async (resolve, reject) => {
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let values = ca[i].split("=");
      if (values[0] === " username") {
        let username = values[1];
        let option = {
          method: "GET",
          headers: {
            "Content-type": "application/json"
          }
        };
        let response = await fetch("/getPortNo", option);
        let json = await response.json();

        if (json.status == "success") {
          console.log(json.port);
          resolve([username, json.port]);
        }
      }
    }
    reject("");
  });
}

async function intializeBaseStuff() {
  return new Promise(async (resolve, reject) => {
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
      db = firebase.database();
      resolve("success");
    } else {
      reject("Error");
    }
  });
}

async function userSignedIn(username) {
  console.log(username);
  //let options = {
  //   method: "GET",
  //   headers: {
  //     "Content-type": "application/json"
  //   },
  //   body: JSON.stringify(username)
  // };
  let response = await fetch(`/:${username}/userdata`);
  let json = await response.json();
  if (json.status === "Success") {
    displayItems(username);
    let userElement = document.createElement("p");
    userElement.textContent = username;
    userElement.style.padding = "50px";

    divDB.prepend(userElement);
  } else {
    console.log("Error");
    alert("Wrong Credentials!");
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
let divDB = document.getElementById("dashboard");
let uploadStatusBar = 0;
let allowedLocationAccess = false;
let statusData = {};
let userCoordinates = {};
let totalCount;
let domusername;
let portNo;
let db;

let noItems;

coordButton.addEventListener("click", getCoordinates);
unorderedList.style.listStyleType = "none";
donateButton.addEventListener("click", showForm);
donate.addEventListener("click", getData);

function showForm() {
  form.style.display = "flex";
  form.style.flexDirection = "column";
  donate.style.display = "block";
  myBar.style.display = "inline-block";
  donateButton.style.display = "none";
}

// function getCoordinates() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(onSuccess, error, {
//       timeout: 10000
//     });
//     allowedLocationAccess = true;
//   } else {
//     alert("Can't get position");
//   }
// }

function getCoordinates() {
  const http = new XMLHttpRequest();
  const url = "https://location.services.mozilla.com/v1/geolocate?key=test";

  http.open("GET", url);
  http.send();

  http.onreadystatechange = e => {
    responseInStr = http.responseText;

    let responseInJson = JSON.parse(responseInStr);

    userCoordinates.lat = responseInJson.location.lat;
    userCoordinates.long = responseInJson.location.lng;

    // console.log(userCoordinates);

    allowedLocationAccess = true;
    coordButton.textContent = "Received Co-Ordinates";
    coordButton.disabled = true;
  };
}

// function onSuccess(position) {
//   console.log(position.coords.latitude);
//   console.log(position.coords.longitude);
//   let lat = position.coords.latitude;
//   let long = position.coords.longitude;
//   userCoordinates.lat = lat;
//   userCoordinates.long = long;

//   coordButton.textContent = "Received Co-Ordinates";
//   coordButton.disabled = true;
// }

function error(err) {
  console.error(err);
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
    let pickupAddress = document.getElementById("address").value;
    let mobile_no = document.getElementById("mobile_no").value;
    let defaultProductStatus = "Awaiting Response";
    let tempKey = "tempKey";

    reader.onload = async function() {
      let date = Date.now();
      blobDataResult = reader.result;
      uploadStatusBar = 20;
      uploadStatusBoard(
        productType,
        pickupAddress,
        blobDataResult,
        userCoordinates,
        tempKey,
        defaultProductStatus,
        mobile_no
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
          pickupAddress: pickupAddress,
          userCoordinates: userCoordinates,
          userName: domusername,
          imageUrl: imageUrl,
          date: date,
          status: defaultProductStatus,
          mobile_no: mobile_no
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
          updateButtonKey(json["autoKey"]);
          alert("Data uploaded");
          // location.reload();
          if (noItems) {
            location.reload();
          }
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

async function uploadStatusBoard(p1, p2, iu, co, key, productStatus, mno) {
  let item = createListItem(p1, p2, iu, co, key, productStatus, mno);
  unorderedList.prepend(item);
  statusBoard.appendChild(unorderedList);
}

function createListItem(
  ptype,
  pickupadd,
  imageUrl,
  coo,
  key,
  productStatus,
  mno
) {
  //pickupadd, imageUrl, coo) {
  let imageEle = document.createElement("img");
  imageEle.src = imageUrl;
  imageEle.width = 100;
  imageEle.height = 100;

  let paraAddEle = document.createElement("p");
  paraAddEle.textContent = pickupadd;

  let paraProEle = document.createElement("p");
  paraProEle.textContent = ptype;

  let latElement = document.createElement("p");
  latElement.textContent = coo.lat;

  let longElement = document.createElement("p");
  longElement.textContent = coo.long;

  let statusEle = document.createElement("p");
  statusEle.textContent = productStatus;

  let mobileEle = document.createElement("p");
  mobileEle.textContent = mno;

  let listItem = document.createElement("li");
  listItem.appendChild(imageEle);

  let myDiv = document.createElement("div");
  myDiv.append(
    paraProEle,
    paraAddEle,
    latElement,
    longElement,
    statusEle,
    mobileEle
  );
  myDiv.setAttribute("id", "myDiv");
  listItem.append(myDiv);

  if (productStatus === "Awaiting Response") {
    let removeButton = document.createElement("button");
    removeButton.textContent = "Remove Item";
    //removeButton.thisItemId = key;
    removeButton.id = key;
    removeButton.addEventListener("click", removeItem);
    removeButton.setAttribute("class", "remove-item " + imageUrl);
    //removeButton.setAttribute("class", imageUrl);
    listItem.append(removeButton);
  }
  return listItem;
}

async function displayItems(username) {
  let loading = document.querySelector("#loading");
  loading.style.display = "flex";
  let status = await intializeBaseStuff();
  console.log(status);
  if (status == "success") {
    console.log("called!");

    let dbRef = db.ref("users/" + username);
    let donatedItemList;
    let undefinedCount = 0;
    let inQueueCount = 0;
    let acceptedCount = 0;
    let itemPickedCount = 0;
    let itemDonatedCount = 0;

    dbRef.once("value", async function(snapshot) {
      donatedItemList = await snapshot.child("DonatedItemList").val(); //Get the values under donated item list

      // Need to work on css
      if (donatedItemList === null) {
        console.log("no items donated yet!");
        noItems = document.createElement("span");
        noItems.textContent = "No Items Donated Yet!";
        noItems.style.fontSize = "30px";
        document.querySelector("#statusBoard").style.justifyContent = "center";
        document.querySelector("#statusBoard").style.alignItems = "center";
        document.querySelector("#loading").style.display = "none";
        document.querySelector("#statusBoard").append(noItems);
        noItems = true;
        // let liItem = document.createElement("li");
        // liItem.textContent = "No items donated yet";
        // statusBoard.appendChild(liItem);
      } else {
        loading.style.display = "none";
        for (item in donatedItemList) {
          //Replace with the required field
          let ptype = donatedItemList[item]["data"]["productType"];
          let imageUrl = donatedItemList[item]["data"]["imageUrl"];
          let pickupadd = donatedItemList[item]["data"]["pickupAddress"];
          let userLocation = donatedItemList[item]["data"]["userCoordinates"];
          let proStatus = donatedItemList[item]["data"]["status"];
          let mobile_no = donatedItemList[item]["data"]["mobile_no"];
          let itemKey = item;

          let documentItem = createListItem(
            ptype,
            pickupadd,
            imageUrl,
            userLocation,
            itemKey,
            proStatus,
            mobile_no
          );
          unorderedList.prepend(documentItem);
          let itemStatus = donatedItemList[item]["data"]["status"];
          //console.log(itemStatus);
          if (itemStatus === "Awaiting Response") {
            inQueueCount++;
          } else if (itemStatus === "Accepted Item") {
            acceptedCount++;
          } else if (itemStatus === "Item Picked") {
            itemPickedCount++;
          } else if (itemStatus === "Item Donated") {
            itemDonatedCount++;
          } else {
            console.log(itemStatus);
            undefinedCount++;
          }
        }
        statusBoard.appendChild(unorderedList);
        let totalCount = Object.keys(donatedItemList).length;
        //console.log(Object.keys(donatedItemList).length);
        //console.log(Object.keys(totalItems).length);
        console.log(
          undefinedCount,
          inQueueCount,
          acceptedCount,
          itemDonatedCount,
          itemPickedCount
        );
        let awaitData = {
          label: "Awaiting Response",
          y: (inQueueCount / totalCount) * 100
        };

        let acceptData = {
          label: "Accepted Items",
          y: (acceptedCount / totalCount) * 100
        };

        let donatedData = {
          label: "Donated Items",
          y: (itemDonatedCount / totalCount) * 100
        };

        let pickedData = {
          label: "Picked Items",
          y: (itemPickedCount / totalCount) * 100
        };

        statusData.pickedData = pickedData;
        statusData.acceptData = acceptData;
        statusData.donatedData = donatedData;
        statusData.awaitData = awaitData;
        console.log(statusData);
        displayChart(statusData);
      }
    });
  } else {
    alert("Error loading firebase data!");
  }
}

function uploadStatusBarFunc() {
  myBar.style.width = uploadStatusBar + "%";
  myBar.textContent = uploadStatusBar + "%";
}

function removeItem(evt) {
  console.log("Called");
  console.log(evt.target.id);
  let key = evt.target.id;
  let imageRef = evt.target.className;
  console.log(domusername);
  let deletionRef = db.ref("users/" + domusername + "/DonatedItemList/" + key);
  let itemDeletionRef = db.ref("Donated_Items_List/" + key);

  itemDeletionRef.remove(() => {
    console.log("Item removed!");
  });
  deletionRef.remove(() => {
    location.reload();
  });
  console.log(imageRef);
  let imageNameSplit = imageRef.split("?");
  let imageName = imageNameSplit[0].split("/");
  imageName = decodeURIComponent(imageName[imageName.length - 1]);
  let storageRef = firebase.storage().ref(imageName);
  storageRef
    .delete()
    .then(() => {
      console.log("Item deleted!");
    })
    .catch(error => {
      console.log(error);
    });
}

function updateButtonKey(key) {
  console.log(key);
  let ele = document.getElementById("tempKey");
  ele.id = key;
  console.log("Key updated!");
}

function displayChart(statusData) {
  let chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    backgroundColor: "transparent",
    title: {
      text: "User Item Status"
    },
    data: [
      {
        type: "pie",
        startAngle: 240,
        yValueFormatString: '##0.00"%"',
        indexLabel: "{label} {y}",
        dataPoints: [
          { y: statusData.awaitData.y, label: statusData.awaitData.label },
          { y: statusData.acceptData.y, label: statusData.acceptData.label },
          { y: statusData.pickedData.y, label: statusData.pickedData.label },
          { y: statusData.donatedData.y, label: statusData.donatedData.label }
        ]
      }
    ]
  });
  chart.render();
}
