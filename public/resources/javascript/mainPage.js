window.onload = displayItems();

let url = new URL(window.location);
let username = url.searchParams.get('username');
userSignedIn(username);

function intializeBaseStuff(){
    return new Promise((resolve, reject)=>{
    let firebaseConfig = {
        apiKey: "AIzaSyCFdFiuXfwk3jpIYUd44XKh0Hp14l63ZJE",
        authDomain: "logon-ka-maseeha.firebaseapp.com",
        databaseURL: "https://logon-ka-maseeha.firebaseio.com",
        storageBucket: "logon-ka-maseeha.appspot.com"
        };
        firebase.initializeApp(firebaseConfig);
        resolve("success");
    });
}

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
    let reader = new FileReader();
    reader.onload = async function(){
        blobDataResult = reader.result;
        console.log(blobDataResult);
        let storageRef = firebase.storage().ref();
        let imageRef = storageRef.child(fileObj.name);

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

async function displayItems(){
    let status = await intializeBaseStuff();
    console.log(status);
    if(status == "success"){
        console.log("called!");
        let statusBoard = document.getElementById('statusBoard');
        let unorderedList = document.createElement('ul');
        unorderedList.style.listStyleType = "none";
        let dbRef = db.ref('users/' + username);
        dbRef.on('value', async function(snapshot){
            donatedItemList = await snapshot.child('DonatedItemList').val();
                for(item in donatedItemList){
                            //Replace with the required field
                    let ptype = donatedItemList[item]['data']['productType'];
                    let imageUrl = donatedItemList[item]['data']['imageUrl'];
                    let pickupadd = donatedItemList[item]['data']['pickupAddress'];

                    let imageEle = document.createElement('img');
                    imageEle.src = imageUrl;
                    imageEle.width = 100;
                    imageEle.height = 100;

                    let paraAddEle = document.createElement('p');
                    paraAddEle.innerText = pickupadd;
                    
                    let paraProEle = document.createElement('p');
                    paraProEle.innerText = ptype;

                    let listItem = document.createElement('li');
                    listItem.appendChild(imageEle);
                    listItem.appendChild(paraProEle);
                    listItem.appendChild(paraAddEle);

                    unorderedList.appendChild(listItem);
                }
            statusBoard.appendChild(unorderedList);
        })
    }
    else{
        alert("Error loading firebase data!");
    }
}