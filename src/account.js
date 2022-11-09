import Header from './header/header';
import Footer from './footer/footer';
import NavBar from './nav/nav-bar';
import './account.css';
import Service from './webservice/http';
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import axios from "axios";
import ProgressBar from './progress-bar';

const Account = () => {
    const [selfDetails, setSelfDetail] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);
    const history = useHistory();

    const services = new Service();

    const [tab, setTab] = useState('Home');

    /**
     * Fetch self details
     */
    function fetchData() {
        services.get('api/access_control/self_details/').then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error');
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setSelfDetail(res);
                    localStorage.setItem('image', res['image']);
                    setError(null);
                }
                catch (e) {
                    setError(e);
                }
            }
        })
    }

    /**
     * Perform logout operation
     */
    const logout = () => {
        services.get('/api/access_control/logout/').then(res => {
            console.log(res);
        })
        localStorage.clear();
        window.location.reload();
        //browser.tabs.reload();
    };

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchData();
    }, [])


    const [passwordChnageError, setPasswordChangeError] = useState('');

    /**
     * CHange password with proper validation
     */
    const changePassword = () => {
        setPasswordChangeError('');
        if (oldPassword === '') {
            setPasswordChangeError('Please Enter your old password');
            return;
        }

        if (newPassword === '') {
            setPasswordChangeError('Please Enter your new password');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordChangeError('Your Password must be of atleast 8 character');
            return;
        }

        if (confirmPassword === '') {
            setPasswordChangeError('Please confirm your new password');
            return;
        }

        if (newPassword != confirmPassword) {
            setPasswordChangeError('Password and Confirmpassword should be same');
            return;
        }

        var data = {
            "old_password": oldPassword,
            "new_password": newPassword
        }
        services.post('api/access_control/change_password/', data).then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error');
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }

                    if (res.message !== 'success') {
                        setPasswordChangeError(res.message)
                    }
                    else {
                        setOldPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setTab('Home');
                        NotificationManager.success('Success', 'Password Changed Successfully');
                    }

                }
                catch (e) {
                    setPasswordChangeError(e);
                }
            }
        })
    }


    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPending, setUploadPending] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);


    /**
     * Upload and change Loggedin user image with axios
     */
    const uploadPhoto = () => {
        if (uploadFile === null) {
            NotificationManager.warning('Warning', 'Please select a photo to upload');
            return;
        }
        setUploadPending(true);
        setUploadError('');
        setUploadProgress(0);
        var url = services.domain + '/api/access_control/change_profile_photo/';
        let formData = new FormData();
        formData.append('file', uploadFile);


        axios.request({
            method: "post",
            url: url,
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token'), },
            data: formData,
            onUploadProgress: (p) => {
                console.log(p.loaded);
                setUploadProgress(Math.round(p.loaded * 100 / uploadFile.size));
            }
        }).then(
            data => {
                setUploadPending(false);
                setUploadError(null);
                console.log(data.data.message);
                if (data.data.message === 'success') {
                    fetchData();
                    setTab('Home');
                    setUploadFile(null);
                    NotificationManager.success('Success', 'Profile Photo Updated');
                }
                else {
                    setUploadPending(false);
                    setUploadError(data.message);
                }
            }
        )
    }
    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <NotificationContainer />
            <div class="container" style={{ paddingTop: "20px" }}>
                {
                    selfDetails &&
                    <div class="main-body">
                        <div class="row">
                            <div class="col-lg-4">
                                <div class="card" style={{ paddingTop: "20px" }}>
                                    <div class="card-body">
                                        <div class="d-flex flex-column align-items-center text-center" style={{ paddingBottom: "30px" }}>
                                            <img src={services.domain + selfDetails.image} alt="Admin" class="rounded-circle p-1 bg-primary" width="150" height="150" />
                                            <div class="mt-3">
                                                <h4>{selfDetails.first_name}&nbsp;{selfDetails.last_name}</h4>
                                                <p class="text-secondary mb-1">{selfDetails.role}</p>
                                                <p class="text-muted font-size-sm">{localStorage.getItem('username')}</p>

                                            </div>
                                        </div>
                                        {/* <hr class="my-4" /> */}
                                        <ul class="list-group list-group-flush">
                                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap" onClick={() => setTab('ChangePassword')}>
                                                <p>Change Password</p>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap" onClick={() => setTab('UploadProfilePic')}>
                                                <p>Change Profile Photo</p>
                                            </li>
                                            <li class="list-group-item d-flex justify-content-between align-items-center flex-wrap" onClick={logout}>
                                                <p>Logout</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {
                                tab == 'Home' &&
                                <div class="col-lg-8">
                                    <div class="card" style={{ padding: "30px", height: "400px" }}>
                                        <div class="card-body">
                                            <div class="row mb-3" style={{ paddingBottom: "20px" }}>
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">Full Name</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <h5>{selfDetails.first_name}&nbsp;{selfDetails.last_name}</h5>
                                                </div>
                                            </div>

                                            <div class="row mb-3" style={{ paddingBottom: "20px" }}>
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">User ID</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <h5>{localStorage.getItem('username')}</h5>
                                                </div>
                                            </div>

                                            <div class="row mb-3" style={{ paddingBottom: "20px" }}>
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">Role</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <h5>{selfDetails.role}</h5>
                                                </div>
                                            </div>

                                            <div class="row mb-3" style={{ paddingBottom: "20px" }}>
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">Reporting To</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <h5>{selfDetails.reporting_to}</h5>
                                                </div>
                                            </div>

                                            <div class="row mb-3" style={{ paddingBottom: "20px" }}>
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">Workspace</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <h5>{selfDetails.client}</h5>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            }

                            {
                                tab == 'ChangePassword' &&
                                <div class="col-lg-8">
                                    <div class="card" style={{ padding: "30px", height: "400px" }}>
                                        <div class="card-body">
                                            <div class="row mb-3">
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">Current Password</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <div className="form-col clearfix">

                                                        <input type="password" placeholder="Enter Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>



                                            <div class="row mb-3">
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">New Password</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <div className="form-col clearfix">

                                                        <input type="password" placeholder="Enter New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>


                                            <div class="row mb-3">
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">Confirm New Password</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <div className="form-col clearfix">

                                                        <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>



                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px", paddingBottom: "10px", paddingTop: "none" }}>
                                                <div className="popup-footer">
                                                    <button className="btn Save pull-right" type="button" onClick={changePassword}> Update  </button>
                                                </div>
                                            </div>


                                            <div class="row mb-3">
                                                <h5 class="mb-0" style={{ color: "red" }}>{passwordChnageError}</h5>
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            }

                            {
                                tab == 'UploadProfilePic' &&
                                <div class="col-lg-8">
                                    <div class="card" style={{ padding: "30px", height: "400px" }}>
                                        <div class="card-body">

                                            <div class="row mb-3" style={{ paddingBottom: "20px" }}>
                                                <div class="col-sm-3">
                                                    <h5 class="mb-0">Select Profile Pic</h5>
                                                </div>
                                                <div class="col-sm-9 text-secondary">
                                                    <div className="form-col clearfix">
                                                        <input type="file" accept="image/*" onChange={e => setUploadFile(e.target.files[0])} />
                                                        {
                                                            uploadFile &&
                                                            <div style={{ textAlign: "center", padding: "10px" }}>
                                                                <img src={URL.createObjectURL(uploadFile)} width="150" height="150" />

                                                                {
                                                                    !uploadPending &&
                                                                    <div className="popup-footer">
                                                                        <button className="btn Save pull-right" type="button" onClick={uploadPhoto}> Upload  </button>
                                                                    </div>
                                                                }
                                                                {
                                                                    uploadPending &&
                                                                    <div>
                                                                        <ProgressBar bgcolor="#271078" progress={uploadProgress} height={20} />
                                                                    </div>
                                                                }
                                                            </div>
                                                        }
                                                    </div>

                                                </div>
                                                <div class="row mb-3">
                                                    <h5 class="mb-0" style={{ color: "red" }}>{uploadError}</h5>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                }
                {
                    isPending &&
                    <div style={{ textAlign: "center" }}>
                        <ClipLoader color="#2056FF" size="50px" />
                    </div>
                }
                {
                    error &&
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: "25px", color: "#FF8520" }}>
                            {
                                error === 'Connection Error' &&
                                <RiSignalWifiErrorFill />
                            }
                            {
                                error !== 'Connection Error' &&
                                <BiError />
                            }
                            {error}
                        </p>
                    </div>
                }

            </div>


            <Footer />
        </div>
    );
}

export default Account;