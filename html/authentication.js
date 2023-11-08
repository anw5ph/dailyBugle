const endpoint = {};
endpoint['login'] = 'http://127.0.0.1:8080/api/login';
  
// Function to check if the provided username and password match a record in the database
async function authenticateUser(inputUsername, inputPassword) {

    let hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(inputPassword))
    .then(hash => {
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

        return hashHex;
    });

    let data = {
        username: inputUsername,
        password: hashedPassword
    };

    let response = await fetch(endpoint['login'], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then( response => response.json())
    .then ( (result) => {
        return result;
    })
    .catch( error => console.error(error));

    console.log(response);

    if (response['auth'] == 'Authenticated') {
        await createCookie("auth-cookie", response['sessionID']);
        return true;
    }
    else {
        return false;
    }
}

function createCookie(name, value) {
    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);

    let cookieString = encodedName + "=" + encodedValue;
    document.cookie = cookieString;
}