let url = new URL(window.location);
let username = url.searchParams.get('username');
userSignedIn(username);

async function userSignedIn(username){
    let response = await fetch(`/:${username}`);
    let json = await response.json();
    
    if(json.status === 'Success'){
        console.log(json);
        let divDB = document.getElementById('dashboard');
        if(divDB){
            console.log("Got db");
        }
        else{
            console.log("Ghanta!");
        }
        let userElement = document.createElement('p');
        userElement.innerHTML = username;
        divDB.appendChild(userElement);
    }
    else{
        console.log("Nope!");
    }
}

let donateButton = document.getElementById('donateItem');
let form = document.getElementById('donationForm');
let donate = document.getElementById('finalDonate');

donateButton.addEventListener('click', showForm);
//donate.addEventListener('click', getData);

function showForm(){
    form.style.display = "block";
    donate.style.display = "block";
}

// function getData(){
//     let productType = document.getElementById('product');
//     let pickupAddress = document.getElementById('address');
// }