import Header from './header/header';
import NavBar from './nav/nav-bar';
import Footer from './footer/footer';
import { useHistory, useParams } from "react-router";
import { useEffect, useState, useRef } from 'react';
import Service from './webservice/http';
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';


const SRDetails = () => {
    const { srID } = useParams();


    const [srDetail, setSRDetail] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const services = new Service();
    const history = useHistory();


    const [statusUnqualified, setStatusUnqualified] = useState(null);
    const [statusPending, setStatusPending] = useState(null);
    const [statusInprogress, setStatusInprogress] = useState(null);
    const [statusTransferred, setStatusTransferred] = useState(null);
    const [statusServiced, setStatusServiced] = useState(null);

    /**
     * Fetch current status of the service request
     */

    function fetchData() {
        services.get(`/api/call/sr/${srID}/details/`).then(res => {
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

                    if (res.status !== '') {
                        if (res.status === 'Unqualified') {
                            setStatusUnqualified('active');
                        }
                        else {
                            setStatusUnqualified('step-active');
                            if (res.status === 'Pending') {
                                setStatusPending('active');
                            }
                            else {
                                setStatusPending('step-active')
                                if (res.status === 'Inprogress') {
                                    setStatusInprogress('active')
                                }
                                else {
                                    setStatusInprogress('step-active')
                                    if (res.status === 'Transferred') {
                                        setStatusTransferred('active');
                                    }
                                    else {
                                        setStatusTransferred('step-active');
                                        if (res.status === 'Serviced') {
                                            setStatusServiced('active');
                                        }
                                        else {
                                            setStatusUnqualified(null);
                                            setStatusPending(null);
                                            setStatusInprogress(null);
                                            setStatusTransferred(null);
                                            setStatusServiced(null);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    setError(null);
                    setSRDetail(res);
                }
                catch (e) {
                    setError(e);
                }

            }
        })
    }

    useEffect(() => {

        setSRDetail(null);
        setIsPending(true);
        setError(null);
        fetchData();

    }, []);

    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />

            <div className="container-fluid">
                <div className="my-call">
                    <div className="my-calls-column">
                        <div className="calls-top-pannel">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="pannel-heading clearfix">
                                        <div className="pannel-heading-icon"><i className="flaticon-incoming-call"></i></div>
                                        <div className="pannel-heading-info">
                                            <p>Service Requests </p>
                                            <h3> Details </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="pannel-nav panel-nav-right clearfix">
                                        <ul className="clearfix">
                                            <li><a href="#" data-toggle="modal" data-target="#New" >Follow  </a></li>
                                            <li><a href="#">Edit  </a></li>
                                            <li><a href="#">Delete   </a></li>
                                            <li><a href="#">Clone   </a></li>
                                        </ul>
                                    </div>
                                    <div className="clear"></div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {srDetail &&
                    <>
                        <div className="my-call">
                            <div className="my-calls-column">
                                <div className="source-details clearfix">
                                    <div className="source-arrow"><i className="icon-down-arrow-round"></i></div>
                                    <div className="source-steps">

                                        <ul className="clearfix">
                                            <li className={statusUnqualified}><a href="#">Unqualified </a></li>
                                            <li className={statusPending}><a href="#">Pending </a></li>
                                            <li className={statusInprogress}><a href="#">Inprogress</a></li>
                                            <li className={statusTransferred}><a href="#">Transferred</a></li>
                                            <li className={statusServiced}><a href="#">Serviced</a></li>
                                        </ul>

                                    </div>
                                </div>
                                <div className="key-source">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="key-source-col">
                                                <h4>Key Fields</h4>
                                                <p className="line">Lead Source </p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="key-source-col">
                                                <h4>Guidance For Success</h4>
                                                <h5>Keep Track of Info of your unqualified leads</h5>
                                                <p>Your lead may be unqualified if they are not interested in your products or they have left the company associated with the prospect.</p>
                                                <ul>
                                                    <li>Document lessons learned for future reference</li>
                                                    <li>Save outreach details and contact information</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lead-tab">
                            <div className="row">
                                <div className="col-md-8 col-sm-12">
                                    <div className="my-call">
                                        <div className="my-calls-column">

                                            <div className="tab_area">
                                                <ul className="tabs01 clearfix">
                                                    <li><a href="#Activity">Activity</a></li>
                                                    <li><a href="#Chatter">Chatter</a></li>
                                                    <li><a href="#Details">Details</a></li>
                                                    <li><a href="#News">News</a></li>
                                                </ul>
                                                <div className="tab_container">

                                                    <div id="Activity" className="tab_content">
                                                        <div className="tab-details">
                                                            <div className="tab-gray">
                                                                <ul className="clearfix">
                                                                    <li className="active"><a href="#">Call Log  </a></li>
                                                                    <li><a href="#"> New Task</a></li>
                                                                    <li><a href="#"> New Even</a></li>
                                                                    <li><a href="#">Email</a></li>
                                                                </ul>
                                                                <div className="search-add clearfix">
                                                                    <div className="search-col">
                                                                        <input type="text" placeholder="Search this list..." />
                                                                        <button type="submit"><i className="icon-Search"></i></button>
                                                                    </div>
                                                                    <div className="add"><a href="#">Add  </a></div>
                                                                </div>
                                                            </div>
                                                            <div className="Upcoming-Overdues">
                                                                <i className="icon-down-arrow-round"></i> <h4>Upcoming Overdues</h4>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div id="Chatter" className="tab_content">
                                                        <h2>Comming Soon</h2>
                                                    </div>
                                                    <div id="Details" className="tab_content">
                                                        <h2>Comming Soon</h2>
                                                    </div>
                                                    <div id="News" className="tab_content">
                                                        <h2>Comming Soon</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                }
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


            <Footer />
        </div>
    );
}

export default SRDetails;