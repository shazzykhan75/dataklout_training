import Header from "./../header/header";
import Footer from "./../footer/footer";
import NavBar from "./../nav/nav-bar";
import { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import Service from './../webservice/http';
import { Link } from "react-router-dom";
import "./../task.css";

const ManageUser = ({ loginStatus }) => {

    const [userList, setUserList] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const services = new Service();
    const history = useHistory();

    const [roleList, setRoleList] = useState(null);


    /**
     * Fetch all the users of the specific client
     */
    function fetchData() {
        services.get('/api/access_control/all_user/').then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {
                setUserList(res);
                setError(null);
            }
        })
    }

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [reportingTo, setReportingTo] = useState('');
    const [roleID, setRoleID] = useState('');
    const [userCreationError, setUserCreationError] = useState('');


    /**
     * Fetch all roles the created roles for this client
     */
    function fetchRoleData() {
        services.get('/api/access_control/all_role/').then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {

            }
            else {
                setRoleList(res);
                setError(null);
            }
        })
    }

    const [showUserModal, setShowUserModal] = useState(false);
    const [savePending, setSavePending] = useState(false);


    /**
     * Toggle user model
     */
    const toggleUserModal = () => {
        setFirstName('');
        setLastName('');
        setReportingTo('');
        setRoleID('');
        setShowUserModal(!showUserModal);
    }

    /**
     * Create new user with proper data validation
     */
    const addNewUser = () => {
        setSavePending(true);
        setUserCreationError('');
        if (email === '' || password === '' || firstName === '' || lastName === '' || roleID === '') {
            setUserCreationError('Email, Password, first name, last name and Role should not be empty');
            setSavePending(false);
            return;
        }

        if (password.length < 8) {
            setUserCreationError('Password should be of atleat 8 characters');
            setSavePending(false);
            return;
        }

        let regEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regEmail.test(email)) {
            setUserCreationError('Please Enter a valid email id');
            setSavePending(false);
            return;
        }

        var newUserDate = {
            "password": password,
            "email": email,
            "first_name": firstName,
            "last_name": lastName,
            "reporting_to": reportingTo,
            "role_id": roleID
        }

        console.log(newUserDate);

        services.post('/api/access_control/create_user/', newUserDate).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                setUserCreationError('Failed ! Please try again...');
                setSavePending(false);
            }
            else {
                if (res.error) {
                    setUserCreationError(res.error);
                    setSavePending(false)
                }

                if (res.message === 'success') {
                    setPassword('');
                    setEmail('');
                    setFirstName('');
                    setLastName('');
                    setRoleID('');
                    setReportingTo('');
                    fetchData();
                    setShowUserModal(false);
                    setSavePending(false);
                }
            }
        })
    }


    useEffect(() => {
        if (!loginStatus) {
            history.push("/login");
        }
        setUserList(null);
        setIsPending(true);
        setError(null);
        fetchData();
        fetchRoleData();

    }, [loginStatus, history,]);

    const styles = {
        redIcon: {
            float: "inherit",
            color: "red"
        },
        greenIcon: {
            float: "inherit",
            color: "green"
        },
        alignTextCenter: {
            textAlign: "center"
        }
    }

    const [showEditModal, setShowEditModal] = useState(false);
    const [userDetail, setUserDetail] = useState(null);

    /**
     * Open edit user modal popup and fetch all details of the specific user
     * @param {*} username Username
     */
    function openEditModal(username) {
        setUserDetail(null);
        services.get(`/api/access_control/manage_user/${username}/`).then(res => {
            console.log(res);

            if (res == 'TypeError: Failed to fetch') {

            }
            else {
                setUserDetail(res);
                setFirstName(res.first_name);
                setLastName(res.last_name);
                setRoleID(res.role_id);
                setReportingTo(res.reporting_to_username);
                setIsActive(res.activation);
                setShowEditModal(true);
            }
        })
    }


    const [isActive, setIsActive] = useState(false);

    /**
     * Update user data
     * @param {*} username Username
     */
    function updateUserData(username) {
        var userData = {
            'role_id': roleID,
            'reporting_to': reportingTo,
            'first_name': firstName,
            'last_name': lastName,
            'is_active': isActive
        }
        console.log(userData);
        setIsPending(true);
        services.post(`/api/access_control/manage_user/${username}/`, userData).then(res => {
            console.log(res);

            if (res == 'TypeError: Failed to fetch') {

            }
            else {
                setIsPending(false);
                setShowEditModal(false);
                setFirstName('');
                setLastName('');
                setRoleID('');
                setReportingTo('');
                fetchData();
            }
        })
    }

    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <div>
                <div className="container-fluid">
                    <div className="my-call">


                        <div className="side-panel-with-table clearfix">
                            <div className="side-panel">

                                <nav className="secondary-menu">
                                    <ul>
                                        <li class="active"><Link to='/user-management/manage-user'><i className="fa fa-user" aria-hidden="true"></i><a>User</a></Link></li>
                                        <li><Link to='/user-management/manage-role'><i className="fa fa-address-book-o" aria-hidden="true"></i><a>Role</a></Link></li>
                                        <li><Link to='/user-management/app-feature'><i className="fa fa-hand-peace-o" aria-hidden="true"></i><a>App Feature</a></Link></li>
                                    </ul>
                                </nav>
                            </div>
                            <div className="call-table">
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="pannel-heading clearfix">
                                                    <div className="pannel-heading-info">
                                                        <p>Manage User </p>
                                                        <h3>Users </h3>
                                                    </div>
                                                </div>
                                                <div className="bradcums">
                                                    <ul className="clearfix">
                                                        <li> <i className="fa fa-circle" aria-hidden="true"></i> {userList && userList.length} Items</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="pannel-nav clearfix">
                                                    <ul className="clearfix">
                                                        <li onClick={toggleUserModal}><a>New </a></li>
                                                    </ul>
                                                </div>
                                                <div className="clear"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <table className="ss">
                                    <thead>
                                        <tr>
                                            <th>
                                                <p>Username</p>

                                            </th>
                                            <th>
                                                <p>First Name</p>

                                            </th>
                                            <th>
                                                <p>Last Name</p>

                                            </th>
                                            <th>
                                                <p>Activation</p>

                                            </th>
                                            <th>
                                                <p>Role</p>

                                            </th>
                                            <th>
                                                <p>Reporting To</p>
                                            </th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {
                                            userList && (
                                                userList.map((user) =>
                                                (
                                                    <tr>
                                                        <td>
                                                            <p className="blue">
                                                                {user.username}
                                                            </p>
                                                        </td>
                                                        <td>
                                                            <p>{user.first_name}</p>
                                                        </td>
                                                        <td>
                                                            <p className="blue">{user.last_name}</p>
                                                        </td>
                                                        <td>
                                                            <p style={{ paddingLeft: "50px" }}>{user.active ?
                                                                <i style={styles.greenIcon} className="fa fa-check" aria-hidden="true" /> :
                                                                <i style={styles.redIcon} className="fa fa-user-times" aria-hidden="true" />
                                                            }
                                                                <i class="fas fa-user-check"></i>
                                                            </p>
                                                        </td>
                                                        <td>
                                                            <p>{user.role}</p>
                                                        </td>
                                                        <td>
                                                            <p>{user.reporting_to}</p>
                                                        </td>
                                                        <td>
                                                            <i onClick={() => openEditModal(user.username)} className="fa fa-pencil-square-o" aria-hidden="true"></i>
                                                        </td>
                                                    </tr>
                                                )
                                                )
                                            )
                                        }
                                    </tbody>
                                </table>

                                {isPending &&
                                    (<div className="empty-call">
                                        Loading...
                                    </div>)}

                                {error &&
                                    (<div className="empty-call">
                                        {error}
                                    </div>)}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />


            {showUserModal &&
                (<div className="modal my-calls-popup show">
                    <div className="backdrop"></div>
                    <div className="modal-dialog" role="document">
                        <div className="my-calls-popup-details">
                            <h2><div className="icon-div"><div><i style={{ color: "white" }} className="fa fa-user" aria-hidden="true"></i></div></div>New User</h2>


                            <div className="my-calls-form">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-col clearfix">

                                            <label>Username / Email </label><br />
                                            <input type="text" placeholder="Enter a unique Username" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        </div>
                                        <div className="form-col clearfix">

                                            <label>Password </label><br />
                                            <input type="password" placeholder="Enter a temporary password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                        </div>


                                        <div className="form-col clearfix">
                                            <label>First Name</label>
                                            <input type="text" placeholder="Enter First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                        </div>
                                        <div className="form-col clearfix">
                                            <label>Last Name</label>
                                            <input type="text" placeholder="Enter Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-col clearfix">
                                            <label>Reporting To</label>
                                            <select onChange={(e) => setReportingTo(e.target.value)}>
                                                <option></option>
                                                {
                                                    userList && (
                                                        userList.map((user) => (
                                                            <option value={user.username} >{user.username} : {user.first_name} &nbsp; {user.last_name}</option>
                                                        ))
                                                    )
                                                }
                                            </select>

                                        </div>


                                        <div className="form-col clearfix">
                                            <label>Role</label>
                                            <select onChange={(e) => setRoleID(e.target.value)}>
                                                <option></option>
                                                {

                                                    roleList.map((role) => (
                                                        <option value={role.role_id}>{role.title}</option>
                                                    ))

                                                }
                                            </select>

                                        </div>


                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <p className="errorColor">{userCreationError}</p>
                                    </div>
                                </div>
                            </div>


                            <div className="border"></div>
                            <div className="popup-footer">
                                {
                                    !savePending && (
                                        <>
                                            <button onClick={toggleUserModal} className="btn" type="button"> Cancel  </button>
                                            <button className="btn Save" type="button" onClick={addNewUser} > Save  </button>
                                        </>
                                    )
                                }

                                {
                                    savePending && (
                                        <>
                                            <button className="btn Save" type="button"> Storing...  </button>
                                        </>
                                    )
                                }
                            </div>
                        </div>

                    </div>
                </div>)}


            {showEditModal &&
                (<div className="modal my-calls-popup show">
                    <div className="backdrop"></div>
                    <div className="modal-dialog" role="document">
                        <div className="my-calls-popup-details">
                            <h2><div className="icon-div"><div><i style={{ color: "white" }} className="fa fa-user" aria-hidden="true"></i></div></div>Edit User</h2>

                            {
                                userDetail &&
                                <>
                                    <div className="my-calls-form">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-col clearfix">

                                                    <label>Username / Email </label><br />
                                                    <p><b>{userDetail.username}</b></p>
                                                </div>

                                                <div className="form-col clearfix">

                                                    <label>Password </label><br />
                                                    <p><b>***************</b></p>
                                                </div>

                                                <div className="form-col clearfix">
                                                    <label>First Name</label>
                                                    <input type="text" placeholder="Enter First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                                </div>
                                                <div className="form-col clearfix">
                                                    <label>Last Name</label>
                                                    <input type="text" placeholder="Enter Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-col clearfix">
                                                    <label>Reporting To</label>
                                                    <select onChange={(e) => setReportingTo(e.target.value)}>
                                                        <option value={userDetail.reporting_to_username}>{userDetail.reporting_to_username} : {userDetail.reporting_to_first_name} &nbsp; {userDetail.reporting_to_last_name}</option>
                                                        <option></option>
                                                        {
                                                            userList && (
                                                                userList.map((user) => (
                                                                    <option value={user.username} >{user.username} : {user.first_name} &nbsp; {user.last_name}</option>
                                                                ))
                                                            )
                                                        }
                                                    </select>

                                                </div>


                                                <div className="form-col clearfix">
                                                    <label>Role</label>
                                                    <select onChange={(e) => setRoleID(e.target.value)}>
                                                        <option value={userDetail.role_id}>{userDetail.role_title}</option>
                                                        {

                                                            roleList.map((role) => (
                                                                <option value={role.role_id}>{role.title}</option>
                                                            ))

                                                        }
                                                    </select>

                                                </div>


                                                <label>Activation </label><br />
                                                <label class="switch">
                                                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(!isActive)} />
                                                    <span class="slider round"></span>
                                                </label>


                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12">
                                                <p className="errorColor">{userCreationError}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border"></div>
                                    <div className="popup-footer">
                                        {
                                            !savePending && (
                                                <>
                                                    <button onClick={() => setShowEditModal(false)} className="btn" type="button"> Cancel  </button>
                                                    <button className="btn Save" type="button" onClick={() => updateUserData(userDetail.username)} > Update  </button>
                                                </>
                                            )
                                        }

                                        {
                                            savePending && (
                                                <>
                                                    <button className="btn Save" type="button"> Updating...  </button>
                                                </>
                                            )
                                        }
                                    </div>

                                </>
                            }

                        </div>

                    </div>
                </div>)}

        </div>
    );
}

export default ManageUser;