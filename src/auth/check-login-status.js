import { useState, useEffect } from 'react';

const CheckLoginStatus = () => {
    const [loginStatus, setLogin] = useState(false);


    /**
     * Check login Status 
     */
    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            setLogin(true);
        }
    });

    return { loginStatus };
}

export default CheckLoginStatus;