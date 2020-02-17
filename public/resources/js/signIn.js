window.onload = getTotalItemsCount();

async function getTotalItemsCount() {
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
    const db = firebase.database();
    let itemCount = db.ref("Donated_Items_List/");
    itemCount.on("value", function(snapshot) {
      let items = Object.keys(snapshot.val()).length;
      console.log(items);
      let numberEle = document.getElementsByClassName("number");
      numberEle[0].textContent = items;
    });
  } else {
    console.log("error");
  }
}
async function onSignIn(googleUser) {
  let profile = googleUser.getBasicProfile();
  console.log("Name: " + profile.getName());
  console.log("Email: " + profile.getEmail());

  let id_token = googleUser.getAuthResponse().id_token;
  let name = profile.getName();
  let id = profile.getId();
  let email = profile.getEmail();

  let data = {
    token: id_token,
    username: name,
    id: id,
    userEmail: email
  };

  let options = {
    method: "POST",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(data)
  };
  let response = await fetch("/googleSignIn", options);
  let json = await response.json();

  if (json.status === "Success") {
    console.log(json.userName);
    //console.log(json.token);
    let username = json.userName;
    if (username.includes(" ")) {
      let data = await addingPercentage(username);
      let modifiedName = data.username;
      if (data.status == "success") {
        console.log(modifiedName);
        window.location =
          "../html/mainPage.html?username=" +
          modifiedName +
          "&token=" +
          json.token;
      }
    } else {
      // window.location =
      //   "../html/mainPage.html?username=" + username + "&token=" + json.token;
    }
  } else {
    console.log("Hell No!");
    console.log(json);
  }
}

function addingPercentage(username) {
  return new Promise((resolve, reject) => {
    username = username.split(" ").join("%20");
    let retObj = {
      status: "success",
      username: username
    };
    resolve(retObj);
  });
}
