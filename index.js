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
  
  console.log("Called!");
  let token = req.body["token"];
  let userName = req.body["username"];
  let email = req.body["userEmail"];
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
  let userName = req.params.user;
  if (userName.includes(":")) {
    userName = userName.replace(":", "");
  }
  let retObj = {
    status: "Success",
    userName: userName
  };
  let userData;
  let userRef = db.ref("users/");
  userRef.once(
    "value"
    ).then((snapshot) => {
      userData = snapshot.child(`/${userName}`).val();
      retObj["email"] = userData.email;
      retObj["pass"] = userData.password;
      if (userData.mobile_no === undefined) {
        retObj["mobile"] = "Not entered";
      } else {
        retObj["mobile"] = userData.mobile_no;
      }
      res.send(retObj);
    }).catch((error) => {
      retObj.status = "Failure";
      retObj.code = error.code;
      retObj.message = error.message;
      res.send(retObj);
      errorObj = retObj;
      errorObj.date = Date();
      //logError(errorObj);
    })
});

app.post("/donateItem", (req, res) => {
  let retObj = {};
  let data = req.body;
  let userCoordinates = data.userCoordinates;
  
  let donatedItemsListRef = db.ref("Donated_Items_List");
  let newItemRef = db.ref("users/" + data.userName + "/DonatedItemList").push();
  
  newItemRef.set({ data }, someParameter => {
    donatedItemsListRef
      .child(newItemRef.key)
      .set({ data }, someParameter1 => {
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
  res.send(retObj);
});

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID
  });

  const payload = ticket.getPayload();
  const userid = payload["sub"];
}

///////////////////////////////////////////////////////////////////////
// NGO Part?
function findOutDistance(lat, long) {
  // to be called everytime a user uploads something
  const NGOs = require("./NGOs.json");

  function sendMail(ngoName) {
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
    });
  }

  function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6731;
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

    if (d < 5.5) {
      sendMail(NGOs[ngo]);
    }
  }
}

// api route to login an ngo
app.post("/NGOlogin", (req, res) => {
  const password = req.body.password;
  let email = req.body.email;
  let name = req.body.NGOName;
  name = name.toLowerCase();
  email = email.toLowerCase();

  const salt = "oofe";

  const ngo = db.ref("NGO_user_accounts/");
  ngo.once("value", async snapshot => {
    let records = await snapshot.val();
    let actualDetails = records[name];

    if (!actualDetails) {
      res.json({ status: "failure" });
    }

    let actualEmail;
    let hashedPassword;
    let actualPosi;

    try {
      actualEmail = actualDetails["email"];
      hashedPassword = actualDetails["password"];
      actualPosi = actualDetails["posi"];
    } catch (error) {
      console.log("Invalid Login Details");
      return;
    }

    const str1 = password.slice(0, actualPosi);
    const str2 = password.slice(actualPosi);

    let finalPassword = str1 + salt + str2;
    const md5 = crypto.createHash("md5");
    const hash = md5.update(finalPassword).digest("hex");

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

      res.json({ status: "success" });

      let itemStatus = db.ref("Donated_Items_List/" + itemKey + "/data/status");
      itemStatus.set("Accepted Item");

      const _userName = itemData.userName;

      let itemFromUser = db.ref("users/" + _userName + "/DonatedItemList"); // itemFromUser is the listing of the item in the user's database
      itemFromUser
        .child("/" + itemKey + "/data")
        .update({ status: "Accepted Item" });
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
});

function logError(errorItems) {
  const errorRef = db.ref("Errors/");
  errorRef.set(errorItems);
}

app.post("/displayItemsForNGO", (req, res) => {
  const _ngoName = req.body._ngoName;
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
    const _donatedRef = db.ref("Donated_Items_List/" + _itemKey + "/data");
    _donatedRef.update({ status: _newStatus });
  });
});
