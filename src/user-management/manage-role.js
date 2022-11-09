import Header from "./../header/header";
import Footer from "./../footer/footer";
import NavBar from "./../nav/nav-bar";
import { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import Service from './../webservice/http';
import { Link } from "react-router-dom";

const ManageRole = ({ loginStatus }) => {

    const [featureList, setFeatureList] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const services = new Service();
    const history = useHistory();

    const [roleList, setRoleList] = useState(null);


    /**
     * Fetch all the role for the specific client
     */
    function fetchData() {
        services.get('/api/access_control/all_role/').then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {
                setRoleList(res);
                setError(null);
            }
        })
    }

    /**
     * Fetch app features available for the client
     */
    function fetchFeatures() {
        services.get('/api/access_control/feature_action/').then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {
                setFeatureList(res);
                setError(null);
            }
        })
    }

    const [roleName, setRoleName] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(false);

    const [showRoleDetailsModal, setShowRoleDetailsModal] = useState(false);

    const toggleRoleModal = () => {
        setShowRoleModal(!showRoleModal);
    }

    const [roleFetchData, setRoleFetchData] = useState(null);
    const [roleFetchPending, setRoleFetchPending] = useState(false);
    const [roleFetchError, setRoleFetchError] = useState(null);


    /**
     * Fetch role details from the api and display in modal
     */
    const toggleRoleDetailsModal = (e) => {

        setShowRoleDetailsModal(!showRoleDetailsModal);
        setRoleFetchData(null);
        setRoleFetchPending(true);
        setRoleFetchError(null);
        services.get(`/api/access_control/manage_role/${e.target.id}/`).then(res => {
            console.log(res);
            setRoleFetchPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setRoleFetchError('Failed to Fetch')
            }
            else {
                setRoleFetchData(res);
                setRoleFetchError(null);
            }
        })
    }

    useEffect(() => {
        setCreateError('');
        if (!loginStatus) {
            history.push("/login");
        }
        setRoleList(null);
        setFeatureList(null);
        setIsPending(true);
        setError(null);
        fetchData();
        fetchFeatures();

    }, [loginStatus, history,]);

    const [permission, setPermission] = useState([]);
    var permissionDetail = [];

    /**
     *  Set permission details JSON while allocating permission while Role creation
     */
    const updatePermissionDetail = (e) => {
        permissionDetail = permission;
        setCreateError('');
        var feature = e.target.id;
        var action = e.target.value;

        //Check if feature is already exist
        var foundFeature = false;
        for (let i = 0; i < permissionDetail.length; i++) {
            if (permissionDetail[i]['feature'] === feature) {
                foundFeature = true;
                //Check if Action is already exist
                var action_list = permissionDetail[i]['action'];
                if (action_list.indexOf(action) === -1) {
                    action_list.push(action);
                } else {
                    for (var k = 0; k < action_list.length; k++) {
                        if (action_list[k] === action) {
                            action_list.splice(k, 1);
                        }
                    }
                }
                permissionDetail[i]['action'] = action_list;
            }
        }

        if (!foundFeature) {
            permissionDetail.push(
                {
                    "feature": feature,
                    "action": [
                        action
                    ]
                }
            );
        }

        for (let i = 0; i < permissionDetail.length; i++) {
            if (permissionDetail[i]['action'].length === 0) {
                permissionDetail.splice(i, 1);
            }
        }
        setPermission(permissionDetail);
        //console.log(permissionDetail);
    }


    const [createError, setCreateError] = useState('');
    const [createPending, setCreatePending] = useState(false);


    /**\
     * Create new role with proper permission
     */
    const createRole = () => {

        setCreatePending(true);
        if (roleName === '') {
            setCreateError("Please Provide a unique role name");
            setCreatePending(false);
            return;
        }

        if (permission.length === 0) {
            setCreateError("Please add permissions");
            setCreatePending(false);
            return;
        }

        var newRoleData = {
            'role_name': roleName,
            'permission_detail': permission
        }
        console.log(newRoleData);


        services.post('/api/access_control/create_role/', newRoleData).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                setCreateError('Failed ! Please try again...');
                setCreatePending(false);
            }
            else {
                if (res.error) {
                    setCreateError(res.error);
                    setCreatePending(false)
                }

                if (res.message === 'success') {
                    setRoleName('');
                    setPermission([]);
                    fetchData();
                    setShowRoleModal(false);
                    setCreatePending(false);
                }
            }
        })

    }

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roleID, setRoleID] = useState('');


    /**
     * Delete role
     */
    const deleteRole = () => {
        setCreatePending(true);
        services.delete(`/api/access_control/manage_role/${roleID}/`).then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {
                fetchData();
                setCreatePending(false);
                setRoleID('');
                setShowDeleteModal(false);
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
                                        <li><Link to='/user-management/manage-user'><i className="fa fa-user" aria-hidden="true"></i><a>User</a></Link></li>
                                        <li className="active"><Link to='/user-management/manage-role'><i className="fa fa-address-book-o" aria-hidden="true"></i><a>Role</a></Link></li>
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
                                                        <p>Manage Role </p>
                                                        <h3>Roles</h3>
                                                    </div>
                                                </div>
                                                <div className="bradcums">
                                                    <ul className="clearfix">
                                                        <li> <i className="fa fa-circle" aria-hidden="true"></i> {roleList && roleList.length} Items</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="pannel-nav clearfix">
                                                    <ul className="clearfix">
                                                        <li onClick={toggleRoleModal}><a>New </a></li>
                                                    </ul>
                                                </div>
                                                <div className="clear"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <table className="ss">
                                    <thead>

                                    </thead>
                                    <tbody>

                                        {
                                            roleList && (
                                                roleList.map(role => (
                                                    <tr>
                                                        <td>
                                                            <p className="blue">{role.title}</p>
                                                        </td>
                                                        <td>
                                                            <i className="fa fa-eye" style={{ color: "green", paddingLeft: "5px", paddingRight: "5px" }} id={role.role_id} onClick={toggleRoleDetailsModal} />
                                                            <i className="fa fa-trash" style={{ color: "red", paddingLeft: "5px", paddingRight: "5px" }} onClick={() => { setShowDeleteModal(true); setRoleID(role.role_id); }} />
                                                        </td>

                                                    </tr>
                                                ))
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

            {showRoleModal &&
                (<div className="modal my-calls-popup show">
                    <div className="backdrop"></div>
                    <div className="modal-dialog" role="document">
                        <div className="my-calls-popup-details">
                            <h2><div className="icon-div"><div><span><img src="assets/images/user-icon.png" className="img-responsive" alt="" /></span></div></div>New Role</h2>


                            <div className="my-calls-form" style={{ height: "600px", overflow: "auto", overflowX: "hidden" }}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-col clearfix">
                                            <label>Role Name </label><br />
                                            <input type="text" placeholder="Enter a unique Role Name" value={roleName} onChange={(e) => { setRoleName(e.target.value) }} />
                                        </div>
                                    </div>
                                </div>
                                {
                                    featureList && (
                                        featureList.map((feature) => (
                                            <>

                                                <div className="my-calls-column">

                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-col clearfix">
                                                                <p className="blue">{feature.feature}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        {
                                                            feature.action.map((action) => (
                                                                <div className="col-md-3">
                                                                    <div className="select-check">
                                                                        <label className="checkbox-container">
                                                                            {action}
                                                                            <input type="checkbox" onChange={updatePermissionDetail} id={feature.feature} value={action} />
                                                                            <span className="checkmark"></span>

                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>

                                            </>
                                        )
                                        )
                                    )
                                }

                                <div className="row">
                                    <div className="col-md-12">
                                        <p className="errorColor">{createError}</p>
                                    </div>
                                </div>
                            </div>



                            <div className="popup-footer">
                                {
                                    !createPending && (
                                        <>
                                            < button className="btn" type="button" onClick={toggleRoleModal}> Cancel  </button>
                                            <button className="btn Save" type="button" onClick={createRole}> Save  </button>
                                        </>
                                    )
                                }

                                {
                                    createPending && (
                                        <>
                                            <button className="btn Save" type="button"> Creating Role...  </button>
                                        </>
                                    )
                                }


                            </div>
                        </div>

                    </div>
                </div>)
            }

            {showRoleDetailsModal &&
                (<div className="modal my-calls-popup show">
                    <div className="backdrop"></div>
                    <div className="modal-dialog" role="document">
                        <div className="my-calls-popup-details">
                            <h2><div className="icon-div"><div><span><img src="assets/images/user-icon.png" className="img-responsive" alt="" /></span></div></div>Permission Details</h2>


                            <div className="my-calls-form">
                                {
                                    roleFetchData && (
                                        <>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-col clearfix">
                                                        <label>Role Name </label><br />
                                                        <label>{roleFetchData.role_name}</label>
                                                    </div>
                                                </div>
                                            </div>
                                            {

                                                roleFetchData.permission_detail.map((feature) => (
                                                    <>

                                                        <div className="my-calls-column">

                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <div className="form-col clearfix">
                                                                        <p className="blue">{feature.feature}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                {
                                                                    feature.action.map((action) => (
                                                                        <div className="col-md-3">
                                                                            <div className="select-check">
                                                                                <label className="checkbox-container">
                                                                                    <i className="fa fa-circle" aria-hidden="true"></i> &nbsp;{action}

                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>

                                                    </>
                                                )

                                                )
                                            }
                                        </>
                                    )
                                }

                                {roleFetchPending &&
                                    (<div className="empty-call">
                                        Loading...
                                    </div>
                                    )
                                }



                                <div className="row">
                                    <div className="col-md-12">
                                        <p className="errorColor">{roleFetchError}</p>
                                    </div>
                                </div>
                            </div>



                            <div className="popup-footer">
                                < button className="btn" type="button" onClick={toggleRoleDetailsModal}> Cancel  </button>
                            </div>
                        </div>

                    </div>
                </div>)
            }

            {
                showDeleteModal &&
                (<div className="modal my-calls-popup show">
                    <div className="backdrop"></div>
                    <div className="modal-dialog" role="document">
                        <div className="my-calls-popup-details">
                            <h2><div className="icon-div"><div><span><img src="assets/images/user-icon.png" className="img-responsive" alt="" /></span></div></div>Delete Role Confirmation</h2>


                            <div className="my-calls-form">
                                <div className="row">

                                </div>

                            </div>



                            <div className="popup-footer">
                                {
                                    !createPending && (
                                        <>
                                            < button className="btn" type="button" onClick={() => setShowDeleteModal(false)}> Cancel  </button>
                                            <button className="btn Save" type="button" onClick={deleteRole}> Delete  </button>
                                        </>
                                    )
                                }

                                {
                                    createPending && (
                                        <>
                                            <button className="btn Save" type="button">Deleting...  </button>
                                        </>
                                    )
                                }


                            </div>
                        </div>

                    </div>
                </div>)
            }


        </div >
    );
}

export default ManageRole;