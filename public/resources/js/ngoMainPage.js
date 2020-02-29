// let loading = document.querySelector("#loading");
// loading.style.display = "flex";

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const _ngoHash = getCookie("ngoHash");
// console.log(_ngoHash);

if (!_ngoHash) {
  document.querySelector("body").display = "none";
  alert(
    "You haven't loggin in as an NGO!\nPlease log in as an NGO and try again!"
  );
  window.location = "http://localhost:8181";
}

function signOutAsNGO() {
  document.cookie = "ngoHash= ; expires= Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "ngoName= ; expires= Thu, 01 Jan 1970 00:00:00 GMT";
  window.location = "http://localhost:8181";
}

document.querySelector("#goBack").addEventListener("click", signOutAsNGO);
