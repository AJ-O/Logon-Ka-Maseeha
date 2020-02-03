const express = require("express");
const bodyParser = require("body-parser");

require("firebase/auth");
require("firebase/firestore");
require("firebase/database");

let firebase = require("firebase/app");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public/"));
app.use(express.static("./public/resources/"));
app.use(express.json({ limit: "1mb" }));

const port = 8181;

let firebaseConfig = {
  apiKey: "AIzaSyCFdFiuXfwk3jpIYUd44XKh0Hp14l63ZJE",
  authDomain: "logon-ka-maseeha.firebaseapp.com",
  databaseURL: "https://logon-ka-maseeha.firebaseio.com",
  projectId: "logon-ka-maseeha",
  storageBucket: "logon-ka-maseeha.appspot.com",
  messagingSenderId: "721444271113",
  appId: "1:721444271113:web:0d0f0921effab091a9f4d8",
  measurementId: "G-ZNVVTNE8YC"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
// firebase.analytics();
app.post("/googleSignIn", (req, res) => {
  console.log("called post!");
  let token = req.body["token"];
  let userName = req.body["username"];
  let email = req.body["userEmail"];

  let data = {
    password: "stud",
    email: email,
    token: token
  };

  let returnObj = {
    status: "Success",
    code: "200",
    message: "Works"
  };

  let credential = firebase.auth.GoogleAuthProvider.credential(token);
  firebase
    .auth()
    .signInWithCredential(credential)
    .catch(function(error) {
      returnObj[status] = "Failure";
      returnObj[code] = error.code;
      returnObj[message] = error.message;
      console.log("Error");
      res.send(returnObj);
    });
  //res.send(returnObj);
  let users = db.ref("users");
  users.once("value", function(snapshot) {
    if (!snapshot.child(userName).exists()) {
      console.log("User does not exist!");
      db.ref("users/" + userName).set(data);
      returnObj["userName"] = userName;
      res.send(returnObj);
    } else {
      returnObj["userName"] = userName;
      res.send(returnObj);
    }
  });
});

app.get("/:user", (req, res) => {
  console.log("called get!");
  console.log("Username: " + req.params.user);

  let userName = req.params.user;
  if (userName.includes(":")) {
    userName = userName.replace(":", "");
    console.log(userName);
  }
  let retObj = {
    status: "Success",
    userName: userName
  };

  let userData = db.ref("users/");
  userData.once("value", function(snapshot) {
    let userRef = snapshot.child(`/${userName}`).val();
    retObj["email"] = userRef.email;
    retObj["pass"] = userRef.password;
    res.send(retObj);
  });
});

function testDistances(lat, long) {
  let ngoRef = db.ref("NGO Coordinates_List");
  ngoRef.once("value", function(snapshot) {
    let ngo_list = snapshot.val();
    for (ngo in ngo_list) {
      //console.log(ngo_list[ngo].Latitude);
      //console.log(ngo_list[ngo].Longitude);
      ngo_lat = ngo_list[ngo].Latitude;
      ngo_long = ngo_list[ngo].Longitude;
      let distance = calcDistance(lat, long, ngo_lat, ngo_long);
      console.log(distance);
    }
  });
}

//testDistances(12.976128000000001, 77.5503872);

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6731; //Earth's radius
  let dLat = deg2rad(lat2 - lat1);
  let dLon = deg2rad(lon2 - lon1);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;
  console.log(d);
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

app.post("/donateItem", (req, res) => {
  let retObj = {};
  let data = req.body;
  console.log(data.userName);
  let newItemRef = db.ref("users/" + data.userName + "/DonatedItemList").push();
  console.log(newItemRef.key); //Getting the auto generated id!
  newItemRef.set({ data }, someParameter => {
    console.log("sp1: ", someParameter);
    console.log("Works");
    retObj.status = "success";
    retObj.autoKey = newItemRef.key;
    res.send(retObj);
  });

  // let updates = {};
  // updates['/newData'] = data;
  // db.ref('users/' + data.userName).update(updates, (someParameter) => {
  //   console.log("sp: ", someParameter);
  // });
});

app.listen(port, () => {
  console.log(`Listening to ${port}`);
});
