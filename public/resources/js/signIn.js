window.onload = getTotalItemsCount();

let cancelCookieNoticeEle = document.getElementById("cancelCookieDisplay");
cancelCookieNoticeEle.addEventListener("click", () => {
  let cancelNoticeEle = document.getElementById("cookie-consent");
  cancelNoticeEle.style.display = "none";
});

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
      if (snapshot.val() == null) {
        let numberEle = document.getElementsByClassName("number");
        numberEle[0].textContent = 0;
      } else {
        let items = Object.keys(snapshot.val()).length;
        console.log(items);
        let numberEle = document.getElementsByClassName("number");
        numberEle[0].textContent = items;
      }
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
  console.log(googleUser);
  let data = {
    token: id_token,
    username: name,
    id: id,
    userEmail: email,
    user: googleUser
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
        window.location = "http://localhost:8181/mainPage.html";
        document.cookie = "username=" + encodeURIComponent(username);
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

// Making the Sign In for the NGO
function displayNGOForm() {
  const ngoForm = document.querySelector(".ngo-login-form");
  document.querySelector(".every").style.filter = "blur(5px)";
  ngoForm.style.display = "flex";
  ngoForm.style.justifyContent = "center";
  ngoForm.style.alignItems = "center";
}

const ngoLog = document.querySelector("#ngo-log");
ngoLog.addEventListener("click", displayNGOForm);

document.querySelector("#go-back").addEventListener("click", () => {
  const ngoForm = document.querySelector(".ngo-login-form");
  ngoForm.style.display = "none";
  document.querySelector(".every").style.filter = "none";
});

// NGO Sign IN
document.querySelector("#ngoBut").addEventListener("click", async () => {
  const email = document.querySelector("#ngo-mail").value;
  const password = document.querySelector("#ngo-password").value;
  const NGOName = document.querySelector("#ngo-name").value;
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password, email, NGOName })
  };

  const response = await fetch("/NGOlogin", options);
  const json = await response.json();

  if (json.status === "success") {
    // redirect to ngo's individual page
    window.location = "http://localhost:8181/ngo.html";

    document.cookie = "ngoHash=" + json.ngoHash;
    document.cookie = "ngoName=" + json.ngoName;
  } else {
    document.querySelector("#alert").style.textAlign = "center";
    document.querySelector("#alert").innerHTML =
      "Your e-mail or password or NGO name were incorrect.<br>Please check your details and try again.<br>If you're convinced that you've entered correct details,<br> contact us on our e-mail <br>(logonkamaseeha@gmail.com)";
  }
});
