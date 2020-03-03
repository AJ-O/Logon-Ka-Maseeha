const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");
//const admin = require("firebase-admin");
const crypto = require("crypto");

require("firebase/auth");
require("firebase/firestore");
require("firebase/database");

let firebase = require("firebase/app");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public/"));
app.use(express.static("./public/resources/"));
app.use(express.static("./public/resources/html"));
app.use(express.static("./public/resources/js"));
app.use(express.json({ limit: "1mb" }));
dotenv.config();

const port = process.env.PORT || 8181;
const client = new OAuth2Client(process.env.CLIENT_ID);

let firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

firebase.initializeApp(firebaseConfig);

// let defaultApp = admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   databaseURL: process.env.databaseURL
// });

const db = firebase.database();

app.post("/googleSignIn", (req, res) => {
  console.log("called post!");
  let token = req.body["token"];
  let userName = req.body["username"];
  let email = req.body["userEmail"];
  //console.log(token);
  let data = {
    email: email
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
    .then(() => {
      let users = db.ref("users");
      users.once("value", snapshot => {
        if (!snapshot.child(userName).exists()) {
          console.log("User does not exist!");
          db.ref("users/" + userName).set(data);
          returnObj["userName"] = userName;
          returnObj["token"] = token;
          res.send(returnObj);
        } else {
          returnObj["userName"] = userName;
          returnObj["token"] = token;
          res.send(returnObj);
        }
      });
    })
    .catch(error => {
      returnObj[status] = "Failure";
      returnObj[code] = error.code;
      returnObj[message] = error.message;
      console.log("Some sort of an error");
      res.send(returnObj);
      errorObj = returnObj;
      errorObj.date = Date();
      logError(errorObj);
    });
});

app.get("/:user/userdata", (req, res) => {
  console.log("called get!");
  //console.log("Username: " + req.body.user);
  console.log("user: " + req.params.user);
  let userName = req.params.user;
  //console.log(token);
  if (userName.includes(":")) {
    userName = userName.replace(":", "");
    console.log(userName);
  }
  let retObj = {
    status: "Success",
    userName: userName
  };

  let userData = db.ref("users/");
  userData.once(
    "value",
    snapshot => {
      let userRef = snapshot.child(`/${userName}`).val();
      retObj["email"] = userRef.email;
      retObj["pass"] = userRef.password;
      if (userRef.mobile_no === undefined) {
        retObj["mobile"] = "Not entered";
      } else {
        retObj["mobile"] = userRef.mobile_no;
      }
      res.send(retObj);
    },
    error => {
      retObj.status = "Failure";
      retObj.code = error.code;
      retObj.message = error.message;
      res.send(retObj);
      errorObj = retObj;
      errorObj.date = Date();
      logError(errorObj);
    }
  );

  // retObj.status = "Failure";javascript
  // retObj.code = error.code;
  // retObj.message = error.message;
  // res.send(retObj);
  // if (token.includes(":")) {
  //   token = token.replace(":", "");
  // }

  // verify(token)
  //   .then(() => {
  //     // let user = firebase.auth().currentUser;
  //     // if (user) {
  //     //   //console.log(Object.keys(user));
  //     //   let currentUserData = Object.keys(user);
  //     //   console.log(currentUserData);
  //     //   console.log(currentUserData[10]);
  //     //   console.log(user["displayName"]);
  //     //   if (user["displayName"] !== userName) {
  //     //     console.log("wrong stuff!");
  //     //   } else {
  //     //     console.log("ur cool!");
  //     //   }
  //     // } else {
  //     //   console.log("not user");
  //     // }

  //   let userData = db.ref("users/");
  //   userData.once("value", function(snapshot) {
  //     let userRef = snapshot.child(`/${userName}`).val();
  //     retObj["email"] = userRef.email;
  //     retObj["pass"] = userRef.password;
  //     if (userRef.mobile_no === undefined) {
  //       retObj["mobile"] = "Not entered";
  //     } else {
  //       retObj["mobile"] = userRef.mobile_no;
  //     }
  //     res.send(retObj);
  //   });
  // })
  //   .catch(error => {
  //     retObj.status = "Failure";
  //     retObj.code = error.code;
  //     retObj.message = error.message;
  //     // console.log("Some sort of an error");
  //     // console.log("error is: " + error);
  //     res.send(retObj);
  //   });
});

app.post("/donateItem", (req, res) => {
  let retObj = {};
  let data = req.body;
  let userCoordinates = data.userCoordinates;

  console.log(data.userName);
  console.log(userCoordinates);

  let donatedItemsListRef = db.ref("Donated_Items_List");
  let newItemRef = db.ref("users/" + data.userName + "/DonatedItemList").push();
  console.log(newItemRef.key); //Getting the auto generated id!
  newItemRef.set({ data }, someParameter => {
    donatedItemsListRef
      .child(newItemRef.key)
      .set({ data }, someParameter1 => {
        console.log("sp1: ", someParameter);
        console.log("Works");
        retObj.status = "success";
        retObj.autoKey = newItemRef.key;
        res.send(retObj);
        //findOutDistance(userCoordinates.lat, userCoordinates.long);
      })
      .catch(error => {
        console.log(error);
        let errorObj = {
          msg: "Synchronization Failed",
          date: Date()
        };
        logError(errorObj);
      });
  });
});

app.listen(port, () => {
  console.log(`Listening to ${port}`);
});

function setDonatedItems() {
  let dlRef = db.ref("Donated_Items_List/");
  dlRef.once("value", async snapshot => {
    let dilRefs = snapshot.val();
    let items = Object.keys(dilRefs);
    let mobile_nos = [
      "9991123456",
      "9114213132",
      "9112315199",
      "1235359181",
      "9383492121",
      "8359134200",
      "9423040923",
      "4930249223"
    ];
    for (dilRef in dilRefs) {
      console.log(dilRef);
      let itemRef = dlRef.child(dlRef[dilRef] + "/data/mobile_no");
      let mobile_no = mobile_nos[Math.floor(Math.random() * mobile_nos.length)];
      await itemRef.set(mobile_no);
    }
    // let usersRef = snapshot.val();
    // let users = Object.keys(usersRef);
    // console.log(users);
    // for (user in users) {
    //   let donatedRef = await snapshot
    //     .child(users[user] + "/DonatedItemList")
    //     .val();
    //   for (donatedItems in donatedRef) {
    //     let donateRef = db
    //       .ref("Donated_Items_List/" + donatedItems)
    //       .set(donatedRef[donatedItems]);
    //   }
    // }
    // let items = snapshot.val();
    // let donatedItemsRef = db.ref("Donated_Items_List/");
    // console.log("called!");
    // for (itemCode in items) {
    //   console.log(itemCode);
    //   let ref = donatedItemsRef.child(itemCode + "/data/status");
    //   let responses = [
    //     "Awaiting Response",
    //     "Accepted Item",
    //     "Item Picked",
    //     "Item Donated"
    //   ];
    //   let response = responses[Math.floor(Math.random() * responses.length)];
    //   let status = await ref.set(response);
    //   console.log(response);
    //   console.log(status);
    // }
  });
}
//setDonatedItems();

app.post("/request_fb_initialization", (req, res) => {
  let firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    storageBucket: process.env.storageBucket
  };
  let retObj = {
    status: "success",
    firebaseConfig: firebaseConfig
  };
  console.log("called fb_config!");
  res.send(retObj);
});

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID
  });

  const payload = ticket.getPayload();
  const userid = payload["sub"];
  //console.log(userid);
}

///////////////////////////////////////////////////////////////////////
// NGO Part?
function findOutDistance(lat, long) {
  // to be called everytime a user uploads something
  const NGOs = require("./NGOs.json");

  function sendMail(ngoName) {
    console.log("ngo is: " + ngoName);
    console.log("ngo email is: " + ngoName.email);
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "logonkamaseeha@gmail.com",
        pass: process.env.gPass
      }
    });

    const mailOptions = {
      from: "logonkamaseeha@gmail.com",
      to: ngoName.email,
      subject: "New item uploaded near you!",
      text: `Hello, a new item has been uploaded near you! Please visit the listings page as soon as possible.`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(err);
      }
      console.log("E-Mail sent");
    });
  }

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
    return d;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  for (let ngo in NGOs) {
    let d = calcDistance(
      lat,
      long,
      NGOs[ngo]["latitude"],
      NGOs[ngo]["longitude"]
    );

    console.log("distance between is: " + d);

    if (d < 5.5) {
      sendMail(NGOs[ngo]);
    }
  }
}

// api route to login an ngo
app.post("/NGOlogin", (req, res) => {
  console.log("in ngo post");
  const password = req.body.password;
  let email = req.body.email;
  let name = req.body.NGOName;
  name = name.toLowerCase();
  email = email.toLowerCase();

  const salt = "oofe";

  const ngo = db.ref("NGO_user_accounts/");
  ngo.once("value", async snapshot => {
    console.log("in val");
    let records = await snapshot.val();
    let actualDetails = records[name];

    if (!actualDetails) {
      res.json({ status: "failure" });
    }

    console.log("after awaiting");

    let actualEmail;
    let hashedPassword;
    let actualPosi;

    try {
      console.log("in try");
      actualEmail = actualDetails["email"];
      hashedPassword = actualDetails["password"];
      actualPosi = actualDetails["posi"];
    } catch (error) {
      console.log("Invalid Login Details");
      return;
    }

    console.log(actualEmail, hashedPassword, actualEmail);

    const str1 = password.slice(0, actualPosi);
    const str2 = password.slice(actualPosi);

    let finalPassword = str1 + salt + str2;
    const md5 = crypto.createHash("md5");
    const hash = md5.update(finalPassword).digest("hex");

    console.log(finalPassword);
    console.log(hash);

    // actualEmail = actualEmail.toLowerCase();
    // name = name.toLowerCase();

    console.log(actualEmail, email);

    if (actualEmail === email && hash === hashedPassword) {
      const ngomd5 = crypto.createHash("md5");
      const ngoHash = ngomd5.update(actualEmail).digest("hex");
      res.json({ status: "success", ngoHash: ngoHash, ngoName: name });
    } else {
      res.json({ status: "failure" });
    }
  });
});

app.get("/getPortNo", (req, res) => {
  let retObj = {
    port: port,
    status: "success"
  };
  res.send(retObj);
});

app.post("/NGOPickingUp", (req, res) => {
  // retrieveing data for the specific id
  let itemKey = req.body.keyOfItem;
  let itemData;
  const _ngoName = req.body._ngoName;
  const _ngoHash = req.body._ngoHash;

  let preExisting = db.ref("Donated_Items_List/" + itemKey);
  preExisting
    .once("value", snapshot => {
      itemData = snapshot.child("/data").val(); // itemData is the actual data of the item, in full
      itemData.status = "Accepted Item";
    })
    .then(() => {
      let newItem = db.ref(
        "NGO_user_accounts/" + _ngoName + "/items_to_be_picked_up/" + itemKey
      ); // new Item is the reference to the database of the ngo's
      newItem.set(itemData);
      newItem.update({ status: "Accepted Item" });

      console.log("inserted into firebase for ngo");
      //console.log(itemData);

      res.json({ status: "success" });

      let itemStatus = db.ref("Donated_Items_List/" + itemKey + "/data/status");
      itemStatus.set("Accepted Item");
      console.log("Status changed in donated items list");

      const _userName = itemData.userName;
      console.log(_userName);

      let itemFromUser = db.ref("users/" + _userName + "/DonatedItemList"); // itemFromUser is the listing of the item in the user's database
      itemFromUser
        .child("/" + itemKey + "/data")
        .update({ status: "Accepted Item" });
      console.log("updated in user's database");
    })
    .catch(err => {
      res.json({ status: "failure" });
      console.error(err);
      const errorObj = {
        errorMessage: err,
        time: Date()
      };
      logError(errorObj);
    });

  console.log(_ngoName);
});

function logError(errorItems) {
  const errorRef = db.ref("Errors/");
  errorRef.set(errorItems);

  console.log("logged error in database");
}

app.post("/displayItemsForNGO", (req, res) => {
  const _ngoName = req.body._ngoName;
  console.log(_ngoName);
  const displayNGOref = db.ref(
    "NGO_user_accounts/" + _ngoName + "/items_to_be_picked_up"
  );
  displayNGOref.once("value", async snapshot => {
    let records = await snapshot.val();

    res.json(records);
  });
});

app.post("/updateStatusNGOSide", (req, res) => {
  const _itemKey = req.body.itemKey;
  const _newStatus = req.body.newStatus;
  const _ngoName = req.body.ngoName;

  const _ngoRef = db.ref(
    "NGO_user_accounts/" + _ngoName + "/items_to_be_picked_up"
  );

  _ngoRef.child("/" + _itemKey).update({ status: _newStatus });
  console.log("updated to status: " + _newStatus);

  res.json({ status: "success" });

  const someRef = db.ref(
    "NGO_user_accounts/" + _ngoName + "/items_to_be_picked_up/" + _itemKey
  );
  someRef.once("value", async snapshot => {
    let _userName = snapshot.val().userName;

    const _userRef = db.ref(
      "users/" + _userName + "/DonatedItemList/" + _itemKey + "/data"
    );
    _userRef.update({ status: _newStatus });
  });
});
