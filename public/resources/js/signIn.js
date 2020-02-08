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
    window.location = "../html/mainPage.html?username=" + json.userName;
  } else {
    console.log("Hell No!");
    console.log(json);
  }
}
