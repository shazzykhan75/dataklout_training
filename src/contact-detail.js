import Header from './header/header';
import Footer from './footer/footer';
import NavBar from './nav/nav-bar';
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from 'react';
import Service from './webservice/http';
import { Link } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const ContactDetail = () => {
    const { contactId } = useParams();
    const services = new Service();
    const history = useHistory();

    const [contactDetail, setContactDetail] = useState(null);

    const [salutation, setSalutation] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [updatePending, setUpdatePending] = useState(false);
    const [errorText, setErrorText] = useState(null);


    /**
     * fetch selected contact details
     */
    function fetchContactDetails() {
        services.get(`api/customer/contact/${contactId}/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("Connection Error");
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setContactDetail(res);
                setSalutation(res.salutation);
                setFirstName(res.first_name);
                setMiddleName(res.middle_name);
                setLastName(res.last_name);
                setSuffix(res.suffix);
                setContactNumber(res.contact_number);
            }
        })
    }

    const [callHistory, setCallHistory] = useState(null);

    /**
     * Fetch call history of the selected conatct
     */
    function fetchCallHistory() {
        services.get(`api/customer/contact/${contactId}/history/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("Connection Error");
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setCallHistory(res);
            }
        })
    }
    useEffect(() => {
        fetchContactDetails();
        fetchCallHistory();
    }, [contactId])


    const [showEditModel, setShowEditModel] = useState(false);

    /**
     * Update contact informations
     */

    const updateContact = () => {
        if (salutation === '' || firstName === '' || lastName === '' || suffix === '' || contactNumber === '') {
            setErrorText('Salutation, First Name, Last Name, Suffix and Contact Number are mandatory fields');
            return;
        }
        var data = {
            "salutation": salutation,
            "first_name": firstName,
            "middle_name": middleName,
            "last_name": lastName,
            "suffix": suffix,
            "contact_number": contactNumber
        }
        console.log(data);
        services.put(`api/customer/contact/${contactId}/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("Connection Error");
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                NotificationManager.success('Success', 'Contact Updated');
                fetchContactDetails();
                setShowEditModel(false);
            }
        })
    }
    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <NotificationContainer />

            <div className="container-fluid">
                {
                    contactDetail &&

                    <div className="row">

                        <div className="col-lg-4">
                            <div className="my-call">
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-md-12" >
                                                <div className="pannel-heading clearfix">
                                                    {
                                                        contactDetail &&
                                                        <>
                                                            <div className="col-md-12" style={{ textAlign: "right", fontSize: "16px", color: "#D68319" }}>
                                                                <i onClick={() => setShowEditModel(true)} className="fa fa-pencil" aria-hidden="true"></i>

                                                            </div>
                                                            <div className="col-md-12" style={{ textAlign: "center", color: "#5680C2", fontSize: "150px" }}>
                                                                <i className="fa fa-user-circle" aria-hidden="true"></i>

                                                            </div>
                                                            <div className="col=md-12" style={{ textAlign: "center", fontSize: "25px" }}>
                                                                <label>
                                                                    {contactDetail.salutation}&nbsp;
                                                                {contactDetail.first_name}&nbsp;
                                                                {contactDetail.middle_name}&nbsp;
                                                                {contactDetail.last_name}</label>
                                                            </div>
                                                            <div className="col=md-12" style={{ textAlign: "center", fontSize: "15px" }}>
                                                                <label>
                                                                    Customer ID : {contactDetail.id}
                                                                </label>
                                                            </div>
                                                            <div className="col=md-12" style={{ textAlign: "center", fontSize: "15px" }}>
                                                                <label>
                                                                    Suffix : {contactDetail.suffix}
                                                                </label>
                                                            </div>
                                                            <div className="col=md-12" style={{ textAlign: "center", fontSize: "20px", color: "#D68319" }}>
                                                                <label>
                                                                    <i className="fa fa-mobile" aria-hidden="true"></i> {contactDetail.contact_number}
                                                                </label>
                                                            </div>
                                                            <div className="col=md-12" style={{ textAlign: "center", fontSize: "20px", color: "#5680C2", paddingTop: "50px" }}>
                                                                {
                                                                    contactDetail.reference__id && (
                                                                        <Link to={`/contact/${contactDetail.reference__id}`}>
                                                                            <a style={{ color: 'black' }}>Contact Reference :</a>&nbsp;
                                                                            <i className="fa fa-user-circle" aria-hidden="true"></i>
                                                                        &nbsp;
                                                                            {contactDetail.reference__salutation}&nbsp;
                                                                            {contactDetail.reference__first_name}&nbsp;
                                                                            {contactDetail.reference__last_name}
                                                                        </Link>
                                                                    )}
                                                            </div>
                                                        </>
                                                    }

                                                </div>

                                            </div>
                                        </div>
                                        <hr />
                                        <div className="row">
                                            <div className="col-md-4" style={{ textAlign: "center" }}>
                                                <a style={{ fontSize: "50px", color: "#1D1F93" }}>{callHistory && callHistory.calls.length}</a><br />
                                                <label>Calls</label>
                                            </div>
                                            <div className="col-md-4" style={{ textAlign: "center" }}>
                                                <a style={{ fontSize: "50px", color: "#1D1F93" }}>{callHistory && callHistory.leads.length}</a><br />
                                                <label>Opportunities</label>
                                            </div>
                                            <div className="col-md-4" style={{ textAlign: "center" }}>
                                                <a style={{ fontSize: "50px", color: "#1D1F93" }}>{callHistory && callHistory.service_requests.length}</a><br />
                                                <label>Service Request</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="my-call">
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <div className="pannel-heading clearfix" style={{ paddingLeft: "30px" }}>
                                                        <div className="pannel-heading-icon"><i className="flaticon-incoming-call"></i></div>
                                                        <div className="pannel-heading-info">
                                                            <p>Calls </p>
                                                            <h3>Call History</h3>
                                                        </div>
                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="call-table">
                                    <table className="ss">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <p>
                                                        Call Date
                                                                            </p>

                                                </th>
                                                <th>
                                                    <p>Product</p>

                                                </th>
                                                <th>
                                                    <p>Call Type</p>

                                                </th>
                                                <th>
                                                    <p>Sentiments</p>

                                                </th>
                                                <th>
                                                    <p>Intent</p>

                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                callHistory && (
                                                    callHistory.calls.map((call) => (

                                                        <tr key={call._id}>

                                                            <td>
                                                                <Link to={`/call/${call._id}/call-insight`}>
                                                                    {call._date}
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                <Link to={`/call/${call._id}/call-insight`}>
                                                                    {call._product_name}
                                                                </Link>
                                                            </td>
                                                            <td>
                                                                <Link to={`/call/${call._id}/call-insight`}>
                                                                    {call._call_type}
                                                                </Link>
                                                            </td>

                                                            {
                                                                (call._intent !== 0) &&
                                                                (
                                                                    <>
                                                                        <td>

                                                                            {call._sentiment > 0 ?
                                                                                <p className="red" style={{ color: "green", }}>
                                                                                    <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                                                <p className="red" style={{ color: "red", }}>
                                                                                    <i className="fa fa-minus-circle" aria-hidden="true" /></p>}

                                                                        </td>
                                                                        <td>

                                                                            {call._intent > 0 ?
                                                                                <p className="red" style={{ color: "green", }}>
                                                                                    <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                                                <p className="red" style={{ color: "red", }}>
                                                                                    <i className="fa fa-minus-circle" aria-hidden="true" /></p>}
                                                                            <div className="select-pop-up">
                                                                                <div className="dropdown">
                                                                                    <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"> <i className="icon-down-arrow-round"></i></button>
                                                                                    <ul className="dropdown-menu">
                                                                                        <li><a href="#">Category&nbsp; : {call._category}</a></li>
                                                                                        <li><a href="#">Agent&nbsp; : {call._agent}</a></li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        </td>


                                                                    </>
                                                                )

                                                            }


                                                        </tr>
                                                    ))

                                                )
                                            }


                                        </tbody>
                                    </table>
                                    {
                                        callHistory && callHistory.calls.length === 0 && (
                                            <div className="empty-call">
                                                No Call History Found
                                            </div>
                                        )
                                    }
                                </div>


                            </div>
                        </div>

                    </div>
                }
                {
                    !contactDetail &&
                    <div className="empty-call">
                        <ClipLoader color="#2056FF" size="50px" />
                    </div>
                }
            </div>
            <Footer />

            {showEditModel &&
                (<div className="modal my-calls-popup show">
                    <div className="backdrop"></div>
                    <div className="modal-dialog" role="document">
                        <div className="my-calls-popup-details">
                            <h2>
                                <div className="icon-div">
                                    <div><span><i style={{ color: "white" }} className="fa fa-user-circle" aria-hidden="true"></i></span></div></div>Update Contact</h2>
                            <div className="my-calls-form">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-col clearfix">

                                            <label>ID </label><br />
                                            <label><b>{contactId}</b></label>
                                        </div>
                                        <div className="form-col clearfix">
                                            <label>First Name  </label> &nbsp;<br></br>
                                            <select className="salutationInput" onChange={(e) => { setSalutation(e.target.value) }}>
                                                <option value="">{salutation}</option>
                                                <option value="Mr.">Mr.</option>
                                                <option value="Mrs.">Mrs.</option>
                                                <option value="Ms.">Ms.</option>
                                            </select>


                                            <input className="firstNameInput" type="text" placeholder="Enter First Name" value={firstName} onChange={(e) => { setFirstName(e.target.value) }} />
                                        </div>

                                        <div className="form-col clearfix">
                                            <label>Middle Name</label>
                                            <input type="text" placeholder="Enter middle Name" value={middleName} onChange={(e) => { setMiddleName(e.target.value) }} />
                                        </div>
                                        <div className="form-col clearfix">
                                            <label>Last Name</label>
                                            <input type="text" placeholder="Enter last Name" value={lastName} onChange={(e) => { setLastName(e.target.value) }} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-col clearfix">
                                            <label>Suffix</label>
                                            <input type="text" placeholder="Enter suffix" value={suffix} onChange={(e) => { setSuffix(e.target.value) }} />
                                        </div>

                                        <div className="form-col clearfix">
                                            <label>Contact Number</label>
                                            <input type="text" placeholder="Enter contact Number" value={contactNumber} onChange={(e) => { setContactNumber(e.target.value) }} />
                                        </div>

                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <p className="errorColor">{errorText}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border"></div>
                            <div className="popup-footer">
                                {
                                    !updatePending && (
                                        <>
                                            <button onClick={() => { setShowEditModel(false) }} className="btn" data-dismiss="modal" type="button"> Cancel  </button>
                                            <button className="btn Save" type="button" onClick={updateContact}> Update  </button>
                                        </>
                                    )
                                }
                                {
                                    updatePending &&
                                    <button className="btn Save" disabled type="button"><b> Storing... </b> </button>
                                }
                            </div>
                        </div>
                    </div>


                </div>)}


        </div>
    );
}

export default ContactDetail;