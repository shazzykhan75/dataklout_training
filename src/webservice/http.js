
/**
 * ALl API response header
 */
const headers = {
    "Accept": "application/json",
    "Content-type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem('access_token')
}

function joinURL(baseURL, url) {
    return (`${baseURL}/${url}`);
}


/**
 * Service Class is able to perform API endpoint operations
 */
class Service {
    constructor() {
        this.domain = "https://fb.dataklout.com";
    }

    request(url, method = "POST", data = null) {
        url = joinURL(this.domain, url);
        const options = {
            headers,
            method,
        }
        if (data) {
            options.body = JSON.stringify({ ...data });
        }

        return fetch(url, options);
    }

    get(url) {
        const method = 'GET';
        return this.request(url, method).then(res => res.json()).catch(err => err);
    }

    post(url, data) {
        const method = 'POST';
        return this.request(url, method, data).then(res => res.json()).catch(err => err);
    }

    put(url, data) {
        const method = 'PUT';
        return this.request(url, method, data).then(res => res.json()).catch(err => err);
    }

    delete(url) {
        const method = 'DELETE';
        return this.request(url, method).then(res => res.json()).catch(err => err);
    }
}

export default Service;