export async function postData(url = '', data = {}, headers?:any) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: headers ? headers : {'Content-Type': 'application/json'},
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data) 
        });

        if (response.status === 200) {
            return response.json();   
        } else {
            return null;
        }

    } catch (error) {
        return error;
    }
}

export async function request(url = '', data = {}, headers?:any) {

    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: headers ? headers : {'Content-Type': 'application/json'},
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data) 
    }).then(data => {
        return data.json();
    }).catch(err => {
        return err;
    });

    return response;

}

export async function postDataQS(url = '', data = {}, headers?:any) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: headers ? headers : {'Content-Type': 'application/json'},
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: new URLSearchParams(data).toString()
        });
        if (response.status === 200) {
            return response.json();   
        } else {
            return null;
        }
    } catch (error) {
        return error;
    }
}


export async function getData(url = '', headers = {}) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: headers,
            redirect: 'follow',
            referrerPolicy: 'no-referrer'
        });
        return response.json();   
    } catch (error) {
        return error;
    }
}

export async function putData(url = '', data = {}, headers:any) {
    try {
        const response = await fetch(url, {
            method: 'PUT',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: headers ? headers : {'Content-Type': 'application/json'},
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data) 
        });
        return response.json();   
    } catch (error) {
        return error;
    }
}