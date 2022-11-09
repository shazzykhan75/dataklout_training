import Header from './header/header';
import Footer from './footer/footer';
import NavBar from './nav/nav-bar';
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import WebPull from './webservice/web-pull';
import { Link } from "react-router-dom";
import Service from './webservice/http';
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiArchiveOut, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import Modal from 'react-modal';


const ArchiveCall = () => {
    const history = useHistory();

    //const { data: callList, error, isPending } = WebPull('https://fb.dataklout.com/api/call/archive_call_list/')
    const [callList, setCallList] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const services = new Service();

    /**
     * Fetch Archrive calls
     */
    function fetchData() {
        services.get('api/call/archive_call_list/').then(res => {
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
                    setCallList(res);
                    setError(null);
                }
                catch (e) {
                    setError(e);
                }
            }
        })
    }



    useEffect(() => {
        setCallList(null);
        fetchData();
    }, [history]);

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };

    const [callID, setCallID] = useState('');
    const [showArchiveModel, setShowArchiveModel] = useState(false);
    function markArchive() {
        var data = {
            'archive_status': false
        }
        services.post(`/api/call/${callID}/mark_archive/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                NotificationManager.success('Success', 'Task Closed');
                setShowArchiveModel(false);
                fetchData();
            }
        })
    }

    function openConfirmationModel(call_id) {
        setShowArchiveModel(true);
        setCallID(call_id);
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
                                        <div className="pannel-heading-icon"><i className="flaticon-incoming-call"></i></div>
                                        <div className="pannel-heading-info">
                                            <p>Calls </p>
                                            <h3>Archive Calls <i className="icon-down-arrow-round"></i></h3>
                                        </div>
                                    </div>
                                    <div className="bradcums">
                                        <ul className="clearfix">
                                            <li> <i className="fa fa-circle" aria-hidden="true"></i> {callList && callList.length} Items</li>
                                        </ul>
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
                                        <div className="select-check">
                                            <p>Call Date</p>
                                        </div>
                                    </th>
                                    <th>
                                        <p>Customer</p>

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

                            {isPending && <tr style={{ height: "400px", textAlignVertical: "center", textAlign: "center", }}>
                                <td colSpan="6">
                                    <ClipLoader color="#2056FF" size="50px" />
                                </td>
                            </tr>
                            }

                            {error && <tr style={{ textAlignVertical: "center", textAlign: "center", }}>
                                <td colSpan="6">
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
                                </td>
                            </tr>
                            }


                            <tbody>

                                {
                                    callList && (
                                        callList.map((call) => (

                                            <tr key={call._id}>

                                                <td>
                                                    <BiArchiveOut size="20" color="green" onClick={() => openConfirmationModel(call._id)} />
                                                &nbsp;&nbsp;
                                                    {call._date}

                                                </td>
                                                <td>
                                                    {call._customer}
                                                </td>
                                                <td>
                                                    {call._product_name}
                                                </td>
                                                <td>
                                                    {call._call_type}
                                                </td>
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

                                            </tr>
                                        ))

                                    )
                                }

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
            <Modal
                isOpen={showArchiveModel}
                style={customStyles}
            >
                <div className="modal-dialog" role="document" >
                    <div className="my-calls-popup-details">
                        <h2>Do you want to remove this call from Archive ?</h2>

                        <div className="popup-footer">

                            <>
                                <button className="btn" type="button" onClick={() => setShowArchiveModel(false)}> Cancel  </button>
                                <button className="btn Save" type="button" onClick={() => markArchive()} > Confirm  </button>
                            </>

                        </div>
                    </div>
                </div>
            </Modal>
        </div>

    );
}

export default ArchiveCall;