const express = require('express');
const bodyParser = require('body-parser');

require('firebase/auth');
require('firebase/firestore');
require('firebase/database');

let firebase = require('firebase/app');

const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public/"));
app.use(express.static('./public/resources/'));
app.use(express.json({limit : '1mb'}));

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
app.post('/googleSignIn', (req, res)=>{
  console.log("called post!");
  let token = req.body["token"];
  let userName = req.body["username"];
  let email = req.body["userEmail"];

  let data = {
      password: "stud",
      email: email,
      token: token
  }

  let returnObj = {
    status: "Success",
    code: "200",
    message: "Works"
  };

  let credential = firebase.auth.GoogleAuthProvider.credential(token);
  firebase.auth().signInWithCredential(credential).catch(function(error){
    returnObj[status] = "Failure"
    returnObj[code] = error.code;
    returnObj[message] = error.message;
    console.log("Error");
    res.send(returnObj);
  });
  //res.send(returnObj);
  let users = db.ref('users');
  users.once('value', function(snapshot){
    if(!snapshot.child(userName).exists()){
      console.log("User does not exist!");
      db.ref('users/' + userName).set(
        data
      );
      returnObj['userName'] = userName;
      res.send(returnObj);
    }
    else{
      returnObj['userName'] = userName;
      res.send(returnObj);
    }
  });
});

app.get('/:user', (req, res) => {
  console.log("called get!");
  console.log('Username: ' + req.params.user);
  
  let userName = req.params.user;
  if(userName.includes(':')){
    userName = userName.replace(':', '');
    console.log(userName);
  }
  let retObj = {
    status: "Success",
    userName: userName
  };

  let userData = db.ref('users/');
  userData.once('value', function(snapshot){
    let userRef = snapshot.child(`/${userName}`).val();
    retObj['email'] = userRef.email;
    retObj['pass'] = userRef.password;
    res.send(retObj);
  }); 
})

app.post('/donateItem', (req, res)=> {
  let retObj = {};
  let data = req.body;
  console.log(data.userName);
  let newItemRef = db.ref('users/' + data.userName + '/DonatedItemList').push();
  console.log(newItemRef.key); //Getting the auto generated id!
  newItemRef.set({data}, (someParameter) => {
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

app.listen(port, ()=>{
    console.log(`Listening to ${port}`);
});