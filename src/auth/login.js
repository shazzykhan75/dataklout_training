import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";


const Login = ({ loginStatus }) => {
    const [username, setUserID] = useState('');
    const [password, setPassword] = useState('');

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const history = useHistory();


    /**
     * Check if the access_token already exist in localstorage
     */
    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            history.push("/");
        }
    }, [history]);



    /**
     * Perform login 
     * 
     * After success login store all the user attributes in localstorage for future use
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        var login_info = { username, password };
        setIsPending(true);
        fetch('https://fb.dataklout.com/api/access_control/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(login_info)
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
            else {
                throw Error('Authentication Fail');
            }
        }).then(data => {
            setIsPending(false);
            localStorage.setItem('access_token', data['access_token']);
            localStorage.setItem('access_token', data['access_token']);
            localStorage.setItem('refresh_token', data['refresh_token']);
            localStorage.setItem('client', data['client']);
            localStorage.setItem('client_id', data['client_id']);
            localStorage.setItem('client_logo', data['client_logo']);
            localStorage.setItem('client_name', data['client_name']);
            localStorage.setItem('first_name', data['first_name']);
            localStorage.setItem('image', data['image']);
            localStorage.setItem('last_name', data['last_name']);
            localStorage.setItem('permission', data['permission']);
            localStorage.setItem('role', data['role']);
            localStorage.setItem('usecase', data['usecase']);
            localStorage.setItem('username', data['username']);
            localStorage.setItem('collection_module', data['collection_module']);
            localStorage.setItem('stock_broking_module', data['stock_broking_module']);
            localStorage.setItem('critical_factor_module', data['critical_factor_module']);
            window.location.reload();
        })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.log('Aborted Fetch');
                }
                else {
                    setIsPending(false);
                    setError(err.message);
                    console.log(err.message);
                }
            })

    }

    return (
        <div className="body-login">
            <div className="login">
                <div className="login-inner-main">
                    <div className="container-fluid">
                        <div className="row">




                            <div className="col-md-4">
                                <div className="login-left">
                                    <div className="login-inner">



                                        <div className="form-logo">
                                            <img src="assets/images/logo.png" alt="" />
                                        </div>
                                        <form onSubmit={handleSubmit}>
                                            <div className="from-class">
                                                <label>User ID</label>
                                                <input type="text" placeholder="Enter Your User Id" required value={username} onChange={(e) => { setUserID(e.target.value) }} />
                                            </div>
                                            <div className="from-class">
                                                <label>Password</label>
                                                <input type="password" placeholder="Enter Your Password" required value={password} onChange={(e) => { setPassword(e.target.value) }} />
                                            </div>
                                            <div className="from-class">
                                                <label className="checkbox-container">Remember Me
                                            <input type="checkbox" />
                                                    <span className="checkmark"></span>
                                                </label>
                                            </div>
                                            <div className="from-class">
                                                {error && <p>{error}</p>}
                                            </div>
                                            <div className="from-class">
                                                {!isPending && <input type="submit" value="Login" />}
                                                {isPending && <input type="submit" disabled value="Checking..." />}

                                            </div>
                                        </form>
                                        <p>Forgot Password? <a href="#">Click Here.</a> <br /> OR <br /><a href="#">Use Custom Domain</a></p>
                                        <h4>Not A Customer Yet? <a href="#">Try For Free</a></h4>


                                    </div>
                                </div>
                            </div>


                            <div className="col-md-6 col-md-offset-1">
                                <div className="hello-bg">
                                    <h2>Say Hello To Your <span>Free Trial</span> Now!</h2>
                                    <p>No Hidden Charges, No Credit Card.</p>
                                    <ul>
                                        <li>Upload Your Own Data Or Use the Pre-loaded </li>
                                        <li>Cloud Based SAAS</li>
                                        <li>Preconfigured Workflow, Reports & Dashboards</li>
                                        <li>Preconfigured Based On User Profile</li>
                                    </ul>
                                    <div className="login-bttn"><a href="#">START MY FREE TRIAL</a></div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Login;
