let submit = document.getElementById('sub');
submit.addEventListener('click', getData);

async function getData(){

    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    let pass = document.getElementById('pass').value;
    let cnp = document.getElementById('cnfPass').value;
    let address = document.getElementById('ta').value;
    let form = document.getElementById('formId');

    if(pass !== cnp){
        alert("incorrect password!");
        document.getElementById('pass').value = '';
        document.getElementById('cnfPass').value = '';  
    }
    else{

        let userObj = {
            name : document.getElementById('name').value,
            phone : document.getElementById('phone').value,
            pass : document.getElementById('pass').value,
            address : document.getElementById('ta').value
        };

        let options = {
            
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(userObj)
        };

        console.log(userObj);
        form.reset();
        let response = await fetch('/submit', options);
        let json = await response.json();
    }
}