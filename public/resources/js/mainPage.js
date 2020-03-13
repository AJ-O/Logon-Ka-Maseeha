getCookie()
  .then(data => {
    portNo = data[1];
    if (data[0] == "''") {
      alert("You haven't signed in\nKindly sign in");
      window.location = "http://logon-ka-maseeha.glitch.me";
    } else {
      domusername = data[0];
      userSignedIn(data[0]);
    }
  })
  .catch(error => {
    console.log(error);
  });

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
          resolve([username, json.port]);
        }
      }
    }
    reject("");
  });
}

async function initializeBaseStuff() {
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
      console.log("Failed to initialize firebase!");
      reject("Error");
    }
  });
}

async function userSignedIn(username) {
  
  let response = await fetch(`/:${username}/userdata`);
  let json = await response.json();
  if (json.status === "Success") {
    displayItems(username);
    let userElement = document.createElement("p");
    userElement.textContent = username;
    userElement.style.padding = "50px";
    userDetailsEle.append(userElement);
    divDB.prepend(userDetailsEle);
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
let userDetailsEle = document.getElementById("userDetails");
let uploadStatusBar = 0;
let allowedLocationAccess = false;
let statusData = {};
let productCountData = {}
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

    allowedLocationAccess = true;
    coordButton.textContent = "Received Co-Ordinates";
    coordButton.disabled = true;
  };
}

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
          updateButtonKey(json["autoKey"]);
          alert("Data uploaded");
          // location.reload();
          if (noItems) {
            location.reload();
          }
        }
      } else {
        alert("Error uploading image, please try again!");
        let errorObj = {
          msg: "Error uploading image",
          date: Date()
        };
        logError(errorObj);
      }
    };
  }
  reader.onerror = function() {
    console.log(reader.error);
  };
  reader.readAsDataURL(fileObj);
}

async function uploadStatusBoard(productType, pickupAddress, imageUrl, coordinates, key, productStatus, mobile_no) {
  let item = createListItem(productType, pickupAddress, imageUrl, coordinates, key, productStatus, mobile_no);
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
  let status = await initializeBaseStuff();
  if (status == "success") {
    

    let dbRef = db.ref("users/" + username);
    let donatedItemList;

    dbRef.once("value", async function(snapshot) {
      donatedItemList = await snapshot.child("DonatedItemList").val(); //Get the values under donated item list

      // Need to work on css
      if (donatedItemList === null) {
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
        
        let awaitData = {
          label: "Awaiting Response",
          y: 0
        };

        let acceptData = {
          label: "Accepted Items",
          y: 0
        };

        let donatedData = {
          label: "Donated Items",
          y: 0
        };

        let pickedData = {
          label: "Picked Items",
          y: 0
        };

        let clothesData = {
          label: "Clothes",
          y: 0
        }
        let utensilsData = {
          label: "Utensils",
          y: 0
        }
        let gamesData = {
          label: "Games",
          y: 0
        }
        let electronicsData = {
          label: "Electronics",
          y: 0
        }
        let furnitureData = {
          label: "Furniture",
          y: 0
        }
        let booksData = {
          label: "Books",
          y: 0
        }
        let toolsData = {
          label: "Tools",
          y: 0
        }
        let othersData = {
          label: "Others",
          y: 0
        }

        for (item in donatedItemList) {
          //Replace with the required field
          let ptype = donatedItemList[item]["data"]["productType"];
          let imageUrl = donatedItemList[item]["data"]["imageUrl"];
          let pickupadd = donatedItemList[item]["data"]["pickupAddress"];
          let userLocation = donatedItemList[item]["data"]["userCoordinates"];
          let itemStatus = donatedItemList[item]["data"]["status"];
          let mobile_no = donatedItemList[item]["data"]["mobile_no"];
          let itemKey = item;

          let documentItem = createListItem(
            ptype,
            pickupadd,
            imageUrl,
            userLocation,
            itemKey,
            itemStatus,
            mobile_no
          );
          unorderedList.prepend(documentItem);

          if(ptype === "Clothes"){
            clothesData.y++;
          }
          else if(ptype === "Books"){
            booksData.y++;
          }
          else if(ptype === "Tools"){
            toolsData.y++;
          }
          else if(ptype === "Furniture"){
            furnitureData.y++;
          }
          else if(ptype === "Electronics"){
            electronicsData.y++;
          }
          else if(ptype === "Utensils"){
            utensilsData.y++;
          }
          else if(ptype === "Games"){
            gamesData.y++;
          } else {
            othersData.y++;
          }
          if (itemStatus === "Awaiting Response") {
            awaitData.y++;
          } else if (itemStatus === "Accepted Item") {
            acceptData.y++;
          } else if (
            itemStatus === "Item Picked" ||
            itemStatus === "Item Picked Up"
          ) {
            pickedData.y++;
          } else if (itemStatus === "Item Donated") {
            donatedData.y++;
          } else {
            undefinedCount++;
          }
        }
        statusBoard.appendChild(unorderedList);
        let totalCount = Object.keys(donatedItemList).length;
        
        let totalCountEle = document.createElement("p");
        totalCountEle.innerHTML = "Total Items Donated: " + totalCount;
        userDetailsEle.append(totalCountEle);

        clothesData.y = (clothesData.y / totalCount) * 100;
        toolsData.y = (toolsData.y / totalCount) * 100;
        furnitureData.y = (furnitureData.y / totalCount) * 100;
        gamesData.y = (gamesData.y / totalCount) * 100;
        electronicsData.y = (electronicsData.y / totalCount) * 100;
        booksData.y = (booksData.y / totalCount) * 100;
        utensilsData.y = (utensilsData.y / totalCount) * 100;
        othersData.y = (othersData.y / totalCount) * 100;

        awaitData.y = (awaitData.y  / totalCount ) * 100;
        acceptData.y = (acceptData.y / totalCount) * 100;
        donatedData.y = (donatedData.y / totalCount) * 100;
        pickedData.y = (pickedData.y / totalCount) * 100;
        
        productCountData.clothesData = clothesData;
        productCountData.toolsData = toolsData;
        productCountData.furnitureData = furnitureData;
        productCountData.gamesData = gamesData;
        productCountData.electronicsData = electronicsData;
        productCountData.booksData = booksData;
        productCountData.utensilsData = utensilsData;
        productCountData.othersData = othersData;

        statusData.pickedData = pickedData;
        statusData.acceptData = acceptData;
        statusData.donatedData = donatedData;
        statusData.awaitData = awaitData;
        displayChart(statusData, productCountData);
      }
    });
  } else {
    alert("Error initializing firebase!");
    let errorObj = {
      msg: "Error initializing firebase",
      date: Date()
    };
    logError(errorObj);
  }
}

function uploadStatusBarFunc() {
  myBar.style.width = uploadStatusBar + "%";
  myBar.textContent = uploadStatusBar + "%";
}

function removeItem(evt) {
  console.log(evt.target.id);
  let key = evt.target.id;
  let imageRef = evt.target.className;
  let deletionRef = db.ref("users/" + domusername + "/DonatedItemList/" + key);
  let itemDeletionRef = db.ref("Donated_Items_List/" + key);

  itemDeletionRef.remove(() => {
    console.log("Item removed!");
  });
  deletionRef.remove(() => {
    location.reload();
  });
  imageRef = imageRef.split(" ");
  let imageNameSplit = imageRef[1].split("?");
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
      let errorObj = {
        msg: error.message,
        date: Date()
      };
      logError(errorObj);
    });
}

function updateButtonKey(key) {
  let ele = document.getElementById("tempKey");
  ele.id = key;
}

function displayChart(statusData, productCountData) {
  let chart1 = new CanvasJS.Chart("chartContainer1", {
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
  chart1.render();
  displayChart2(productCountData);
}

function displayChart2(productCountData){
  let chart2 = new CanvasJS.Chart("chartContainer2", {
    animationEnabled: true,
    backgroundColor: "transparent",
    title: {
      text: "Product Types"
    },
    data: [
      {
        type: "pie",
        startAngle: 240,
        yValueFormatString: '##0.00"%"',
        indexLabel: "{label} {y}",
        dataPoints: [
          { y: productCountData.clothesData.y, label: productCountData.clothesData.label },
          { y: productCountData.gamesData.y, label: productCountData.gamesData.label },
          { y: productCountData.utensilsData.y, label: productCountData.utensilsData.label },
          { y: productCountData.furnitureData.y, label: productCountData.furnitureData.label },
          { y: productCountData.toolsData.y, label: productCountData.toolsData.label },
          { y: productCountData.booksData.y, label: productCountData.booksData.label },
          { y: productCountData.electronicsData.y, label: productCountData.electronicsData.label },
          { y: productCountData.othersData.y, label: productCountData.othersData.label }
        ]
      }
    ]
  });
  chart2.render();
}

function logError(errorObj) {
  db.ref("Error/").set(errorObj);
}
