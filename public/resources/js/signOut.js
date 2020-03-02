let signOutButton = document.getElementById("gSignOut");

signOutButton.addEventListener("click", signOut);

function signOut() {
  let auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    document.cookie = "username=''; expires= Thu, 01 Jan 1970 00:00:00 GMT";
    console.log("Signed Out Mate!!");
    window.location = "http://localhost:8181";
  });
}
