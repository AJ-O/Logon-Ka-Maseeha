let url = new URL(window.location);
let username = url.searchParams.get('username');
userSignedIn(username);

let firebaseConfig = {
    apiKey: "AIzaSyCFdFiuXfwk3jpIYUd44XKh0Hp14l63ZJE",
    authDomain: "logon-ka-maseeha.firebaseapp.com",
    databaseURL: "https://logon-ka-maseeha.firebaseio.com",
    storageBucket: "logon-ka-maseeha.appspot.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
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
donate.addEventListener('click', getData);

function showForm(){
    form.style.display = "block";
    donate.style.display = "block";
}

async function getData(){
    let blobDataResult;
    let productType = document.getElementById('product').value;
    let pickupAddress = document.getElementById('address').value;
    let fileObj = document.getElementById('filename').files[0];
    //let file = document.getElementById('filename');
    console.log(fileObj);
    let reader = new FileReader();
    reader.onload = async function(){
        blobDataResult = reader.result;
        console.log(blobDataResult);
        let storageRef = firebase.storage().ref();
        let imageRef = storageRef.child(fileObj.name);
        // let uesrImageRef = await imageRef.put(blobDataResult).then((snapshot)=>{
        //     snapshot.ref.getDownloadURL().then((downloadUrl) => {
        //         console.log(downloadUrl)
        //     }).catch((err)=> {
        //         console.log(err);
        //     })
        // }).catch((err)=>{
        //     console.log(err);
        // });

        let userImageRef = await imageRef.put(blobDataResult);
        console.log(userImageRef);
        if(userImageRef.state == "success"){
            let imageUrl = await userImageRef.ref.getDownloadURL();
            
            let retObj = {
                productType: productType,
                pickupAddress: pickupAddress,
                userName: username,
                imageUrl: imageUrl
            };

            let option = {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(retObj)
            }
            let donatedItemList = {}
            let response = await fetch('/donateItem', option);
            let json = await response.json();
            if(json.status == "success"){
                alert("Data uploaded");
                let dataRef = db.ref('users/' + username);
                dataRef.once('value', async function(snapshot){
                    donatedItemList = await snapshot.child('DonatedItemList').val();
                    for(item in donatedItemList){
                        console.log(donatedItemList[item]['data']['productType']);//Replace with the required field
                    }
                });
            }
        }
        else{
            console.log("Try again");
        }
    }
    reader.onerror = function(){
        console.log(reader.error);
    }
    reader.readAsArrayBuffer(fileObj);
}