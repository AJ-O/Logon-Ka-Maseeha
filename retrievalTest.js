require("firebase/auth");
require("firebase/firestore");
require("firebase/database");

const firebase = require("firebase/app");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const firebaseConfig = {
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

const DB = firebase.database();

const someRef = DB.ref(
  "NGO_user_accounts/" +
    "another random charity" +
    "/items_to_be_picked_up/" +
    "-M1H7PL0g2HVeprczxTa"
);

let user = "";
someRef.once("value", async snapshot => {
  user = await snapshot.val().userName;
});

console.log(user);
