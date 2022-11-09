import Header from './header/header';
import NavBar from './nav/nav-bar';
import Footer from './footer/footer';
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import WebPull from './webservice/web-pull';
import { Link } from "react-router-dom";
import Service from './webservice/http';
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';
import Filter from './filter';
import { FaFilter } from "react-icons/fa";


const ServiceRequestList = (loginStatus) => {
    const history = useHistory();

    const [srList, setSRList] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const services = new Service();

    /**
     * Fetch service request list 
     */
    function fetchData() {
        services.get('/api/call/service_requests/').then(res => {
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
                    setSRList(res);
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
        fetchData();
    }, []);


    const [sideBarWidth, setSideBarWidth] = useState(0);
    const changeSideBarWidth = () => {
        if (sideBarWidth == 570) {
            setSideBarWidth(0);
        }
        else {
            setSideBarWidth(570);
        }
    }

    const filterHasChanged = () => {
        fetchData();
    }

    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />

            <a onClick={changeSideBarWidth} style={{
                position: "fixed",
                transition: ".5s",
                top: "30%",
                right: sideBarWidth,
                backgroundColor: "#F99E52",
                color: "white",
                borderTopColor: "black",
                borderWidth: "2px",
                boxShadow: "6px 6px 3px #999",
                paddingTop: "15px",
                paddingLeft: "5px",
                paddingRight: "5px",
                height: "45px",
                zIndex: "2"
            }}>
                <FaFilter size="20" />
            </a>
            <Filter width={sideBarWidth} changeSideBarWidth={changeSideBarWidth} filterType="service-request" filterHasChanged={filterHasChanged} />
            {
                sideBarWidth == 570 &&
                <div className="backdrop" style={{ zIndex: 1, height: "2500px" }}></div>
            }

            <div className="container-fluid">
                <div className="my-call">
                    <div className="my-calls-column">
                        <div className="calls-top-pannel">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="pannel-heading clearfix">
                                        <div className="pannel-heading-icon"><i className="flaticon-incoming-call"></i></div>
                                        <div className="pannel-heading-info">
                                            <p>Received Service Requests </p>
                                            <h3>Service Requests</h3>
                                        </div>
                                    </div>
                                    <div className="bradcums">
                                        <ul className="clearfix">
                                            <li> <i className="fa fa-circle" aria-hidden="true"></i> {srList && srList.length} Items</li>
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
                                        <p>Call Date</p>
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
                                    srList && (
                                        srList.map((sr) => (

                                            <tr key={sr._id} onClick={() => history.push(`/call/${sr._id}/sr-details`)}>

                                                <td>
                                                    {sr._date}
                                                </td>
                                                <td>
                                                    {sr._customer}
                                                </td>
                                                <td>
                                                    {sr._product_name}
                                                </td>
                                                <td>
                                                    {sr._status}
                                                </td>
                                                <td>

                                                    {sr._sentiment > 0 ?
                                                        <p className="red" style={{ color: "green", }}>
                                                            <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                        <p className="red" style={{ color: "red", }}>
                                                            <i className="fa fa-minus-circle" aria-hidden="true" /></p>}

                                                </td>
                                                <td>

                                                    {sr._intent > 0 ?
                                                        <p className="red" style={{ color: "green", }}>
                                                            <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                        <p className="red" style={{ color: "red", }}>
                                                            <i className="fa fa-minus-circle" aria-hidden="true" /></p>}
                                                    <div className="select-pop-up">
                                                        <div className="dropdown">
                                                            <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"> <i className="icon-down-arrow-round"></i></button>
                                                            <ul className="dropdown-menu">
                                                                <li><a href="#">Category&nbsp; : {sr._category}</a></li>
                                                                <li><a href="#">Agent&nbsp; : {sr._agent}</a></li>
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
        </div>
    );
}

export default ServiceRequestList;