import Header from './header/header';
import Footer from './footer/footer';
import NavBar from './nav/nav-bar';
import { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import WebPull from './webservice/web-pull';
import { Link } from "react-router-dom";
import WebPush from './webservice/web-push';
import './contact.css';
import Service from './webservice/http';
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';


const Contact = ({ loginStatus }) => {
    const [contactID, setContactID] = useState('');
    const [salutation, setSalutation] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [referenceID, setReferenceID] = useState('');
    const [relation, setRelation] = useState('');
    const [errorText, setErrorText] = useState('');

    const history = useHistory();

    const [showModal, setShowModal] = useState(false);
    const toggleModal = () => { setShowModal(!showModal) }

    //let { data: contactList, error, isPending } = WebPull('https://fb.dataklout.com/api/customer/contact/')

    const [contactList, setContactList] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const services = new Service();

    /**
     * Fetch contact list
     */
    function fetchData() {
        services.get('/api/customer/contact/').then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setContactList(res);
                    setError(null);
                }
                catch (e) {
                    setError(e);
                }

            }
        })
    }


    useEffect(() => {
        if (!loginStatus) {
            history.push("/login");
        }
        setContactList(null);
        setIsPending(true);
        setError(null);
        fetchData();

    }, [loginStatus, history,]);


    const [showConfirmation, setShowConfirmation] = useState(false);


    /**
     * Create New contact
     */
    const addNewContact = () => {
        setErrorText('');
        if (salutation === '' || firstName === '' || lastName === '' || suffix === '' || contactNumber === '') {
            setErrorText('Salutation, First Name, Last Name, Suffix and Contact Number are mandatory fields');
            return;
        }
        if (referenceID !== '') {
            if (relation === '') {
                setErrorText('Please Mention relation');
                return;
            }
        }

        setShowConfirmation(true);

    }

    const cancelAddContact = () => {
        setShowConfirmation(false);
    }


    const [isStorePending, setIsStorePending] = useState(false);
    const [storeError, setStoreError] = useState('');


    /**
     * Post new contact information to api service
     */
    const confirmAddNewContact = () => {
        setIsStorePending(true);
        var contactData = {
            "id": contactID,
            "salutation": salutation,
            "first_name": firstName,
            "middle_name": middleName,
            "last_name": lastName,
            "suffix": suffix,
            "contact_number": contactNumber,
            "reference": referenceID,
            "reference_relation": relation
        }


        services.post('/api/customer/contact/', contactData).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                NotificationManager.success('Success', 'Contact Created');
                setContactID('');
                setSalutation('');
                setFirstName('');
                setLastName('');
                setMiddleName('');
                setSuffix('');
                setContactNumber('');
                setReferenceID('');
                setRelation('');
                setErrorText('');

                setShowConfirmation(false);
                setIsStorePending(false);
                setShowModal(false);
                fetchData();
            }
        })
    }

    return (

        <div className="dashboard-body">
            <Header />
            <NavBar />
            <NotificationContainer />

            <div className="container-fluid">
                <div className="my-call">

                    <div className="my-calls-column">
                        <div className="calls-top-pannel">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="pannel-heading clearfix">
                                        <div className="pannel-heading-info">
                                            <p>Contact List </p>
                                            <h3>Manage Contacts</h3>
                                        </div>
                                    </div>
                                    <div className="bradcums">
                                        <ul className="clearfix">
                                            <li> <i className="fa fa-circle" aria-hidden="true"></i> {contactList && contactList.length} Items</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="pannel-nav clearfix">
                                        <ul className="clearfix">
                                            <li onClick={toggleModal}><a>New </a></li>
                                        </ul>
                                    </div>
                                    <div className="clear"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="call-table">
                        <table className="ss">
                            <thead>
                                <tr>
                                    <th>
                                        <p>ID</p>
                                    </th>

                                    <th>
                                        <p>Name</p>
                                    </th>


                                    <th>
                                        <p>Suffix</p>
                                    </th>

                                    <th>
                                        <p>Reference ID</p>
                                    </th>

                                    <th>
                                        <p>Contact Number</p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {contactList && (

                                    contactList.map((contact) => (

                                        <tr onClick={() => history.push(`/contact/${contact.id}`)}>
                                            <td>
                                                {contact.id}
                                            </td>
                                            <td>
                                                {contact.salutation}&nbsp;{contact.first_name}&nbsp;{contact.middle_name}&nbsp;{contact.last_name}
                                            </td>
                                            <td>
                                                {contact.suffix}
                                            </td>
                                            <td>{contact.reference}</td>
                                            <td>
                                                {contact.contact_number}
                                            </td>
                                        </tr>
                                    ))

                                )}
                            </tbody>
                        </table>
                        {isPending && <div className="empty-call">
                            <ClipLoader color="#2056FF" size="50px" />
                        </div>
                        }

                        {error && <div className="empty-call">
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
                </div>
            </div>
            <Footer />


            {showModal &&
                (<div className="modal my-calls-popup show">
                    <div className="backdrop"></div>
                    <div className="modal-dialog" role="document">
                        <div className="my-calls-popup-details">
                            <h2><div className="icon-div"><div><span><img src="assets/images/user-icon.png" className="img-responsive" alt="" /></span></div></div>New Contact</h2>

                            {!showConfirmation && (
                                <div className="my-calls-form">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-col clearfix">

                                                <label>ID (Optional) </label><br />
                                                <input type="text" placeholder="Enter ID" value={contactID} onChange={(e) => { setContactID(e.target.value) }} />
                                            </div>
                                            <div className="form-col clearfix">
                                                <label>First Name  </label> &nbsp;<br></br>
                                                <select className="salutationInput" onChange={(e) => { setSalutation(e.target.value) }}>
                                                    <option value=""></option>
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

                                            <div className="form-col clearfix">
                                                <label>Reference  </label>
                                                <select onChange={(e) => { setReferenceID(e.target.value) }} >
                                                    <option value=""></option>
                                                    {contactList && (
                                                        contactList.map((contact) => (
                                                            <option value={contact.id}>{contact.id}&nbsp;: &nbsp;{contact.first_name}&nbsp;{contact.middle_name}&nbsp;{contact.last_name}</option>
                                                        )))
                                                    }

                                                </select>
                                            </div>

                                            <div className="form-col clearfix">
                                                <label>Relation with reference</label>
                                                <input type="text" placeholder="Enter relation with reference" value={relation} onChange={(e) => { setRelation(e.target.value) }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <p className="errorColor">{errorText}</p>
                                        </div>
                                    </div>
                                </div>)}

                            {showConfirmation && (
                                <div className="my-calls-form">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-col clearfix">

                                                <label>ID</label><br />
                                                <label><b>{contactID}</b></label>
                                            </div>
                                            <div className="form-col clearfix">
                                                <label>First Name</label> <br />
                                                <label><b>{salutation}</b></label> &nbsp; <label><b>{firstName}</b></label>

                                            </div>
                                            <div className="form-col clearfix">
                                                <label>Middle Name</label><br />
                                                <label><b>{middleName}</b></label>
                                            </div>
                                            <div className="form-col clearfix">
                                                <label>Last Name</label><br />
                                                <label><b>{lastName}</b></label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-col clearfix">
                                                <label>Suffix</label><br />
                                                <label><b>{suffix}</b></label>
                                            </div>

                                            <div className="form-col clearfix">
                                                <label>Contact Number</label><br />
                                                <label><b>{contactNumber}</b></label>
                                            </div>

                                            <div className="form-col clearfix">
                                                <label>Reference  </label><br />
                                                <label><b>{referenceID}</b></label>
                                            </div>

                                            <div className="form-col clearfix">
                                                <label>Relation with reference</label><br />
                                                <label><b>{relation}</b></label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <p className="errorColor">{errorText}</p>
                                        </div>
                                    </div>
                                </div>)
                            }

                            <div className="border"></div>
                            <div className="popup-footer">
                                {!isStorePending && (<button onClick={toggleModal} className="btn" data-dismiss="modal" type="button"> Cancel  </button>)}
                                {!showConfirmation && (<button className="btn Save" type="button" onClick={addNewContact}> Save  </button>)}
                                {showConfirmation && !isStorePending && (<button className="btn Save" type="button" onClick={confirmAddNewContact}><b> Confirm </b> </button>)}
                                {showConfirmation && isStorePending && (<button className="btn Save" disabled type="button"><b> Storing... </b> </button>)}
                            </div>
                        </div>
                    </div>


                </div>)}
        </div>
    );
}

export default Contact;
