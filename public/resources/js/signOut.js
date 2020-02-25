let signOutButton = document.getElementById("gSignOut");

signOutButton.addEventListener("click", signOut);

function signOut() {
  let auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    document.cookie = "username=''";
    console.log("Signed Out Mate!!");
    window.location = "http://localhost:8181";
  });
}
