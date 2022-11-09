import { useState, useEffect } from 'react';


const WebPush = (url, postData) => {
    const [data, setData] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortConst = new AbortController();

        setTimeout(() => {
            fetch(url, {
                signal: abortConst.signal,
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
                body: JSON.stringify(postData)
            })
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    }
                    else if (res.statusText === 'Unauthorized') {
                        throw Error('Unauthorized');
                    }
                    else {
                        throw Error('could not fetch the data');
                    }
                })
                .then(data => {
                    setIsPending(false);
                    setData(data);
                    setError(null);
                })
                .catch(err => {
                    if (err.name === 'AbortError') {
                        console.log('Aborted Fetch');
                    }
                    else if (err.message === 'Unauthorized') {
                        localStorage.clear();
                        window.location.reload();
                    }
                    else {
                        setIsPending(false);
                        setError(err.message);
                    }
                })
        }, 1000);

        return () => abortConst.abort();

    }, [url])

    return { data, isPending, error };
}


export default WebPush;



