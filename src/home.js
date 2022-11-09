import Header from './header/header';
import Footer from './footer/footer';
import NavBar from './nav/nav-bar';
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import './home.css';
import Highcharts, { color } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import histogram from "highcharts/modules/histogram-bellcurve.js";
import Masonry from "react-masonry-css";
import Service from './webservice/http';
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill } from 'react-icons/ri';
import { MdAddIcCall } from 'react-icons/md';
import { RiChatVoiceLine } from 'react-icons/ri';
import { VscGitPullRequestCreate } from 'react-icons/vsc';
import { MdIntegrationInstructions } from 'react-icons/md';

const Home = () => {

    const history = useHistory();
    const services = new Service();

    const [cxScoreData, setCXScoreData] = useState();
    const [sentimentData, setSentimentData] = useState();
    const [recentCalls, setRecentCalls] = useState(null);
    const [managerComment, setManagerComment] = useState(null);
    const [leadStatus, setLeadStatus] = useState(null);
    const [serviceRequestStatus, setServiceRequestStatus] = useState(null);
    const [pendingTask, setPendingTask] = useState(null);
    const [callBack, setCallBack] = useState(null);


    histogram(Highcharts);

    /**
       * Fetch homepage data onload
       * 
       */
    useEffect(() => {
        fetchFullScriptData();
        fetchRecentCall();
        fetchManagerComment();
        fetchOpportunities();
        fetchServiceRequest();
        fetchPendingTask();
        fetchCallBackRequests();

        fetchCxScoreTrend();
        fetchIntentData();
        var newDate = new Date();
        // var tempData = [];
        // for (let i = 7; i > 0; i--) {
        //     newDate = new Date();
        //     newDate.setDate(newDate.getDate() - i);
        //     //console.log(newDate);
        //     tempData.push(
        //         [newDate, Math.floor(Math.random() * (65 - 35) + 35)]
        //     )
        // }
        // setCXScoreData(tempData);
        var sentiment_list = [
            -0.7, -0.7, -0.7, -0.7, -0.7, -0.7,
            - 0.6, -0.6, -0.6, -0.6,
            -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5,
            -0.4, -0.4, -0.4, -0.4, -0.4, -0.4, -0.4, -0.4,
            -0.3, -0.3, -0.3, -0.3, -0.3, -0.3,
            -0.2, -0.2, -0.2, -0.2,
            -0.1, -0.1,
            0.0, 0.0, 0.0,
            0.1, 0.1, 0.1, 0.1, 0.1,
            0.2, 0.2, 0.2, 0.2, 0.2, 0.2,
            0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3,
            0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4,
            0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
            0.6, 0.6, 0.6, 0.6, 0.6,
            0.7, 0.7
        ];
        setSentimentData(sentiment_list);

    }, []);


    /**
       * Fetch CX Score trend
       */
    function fetchCxScoreTrend() {

        var today = new Date();
        var endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - 180);
        var startDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // console.log(start_date, end_date)

        services.get(`api/report/${startDate}/${endDate}/cx_score_trend/`).then(res => {
            console.log(res);
            // setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                // setError('Connection Error');
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    var cxData = []
                    var dates = []
                    res.map(item => {
                        cxData.push([
                            item.call_date,
                            item.AverageCX
                        ])
                        dates.push(item.call_date)
                    })
                    setCXScoreData(cxData);
                    setDisplayDateCategory(dates);
                }
                catch (e) {
                    // setError(e);
                }
            }
        })
    }

    const [displayDateCategory, setDisplayDateCategory] = useState([])

    /**
     * set CX Trend chart config
     */
    const cxTrendOptions = {
        chart: {
            type: 'scatter',
            height: (6 / 14 * 100) + '%'
            //margin: [70, 50, 60, 80]
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        credits: {
            enabled: false
        },
        xAxis: {
            categories: displayDateCategory,
            gridLineWidth: 0,
            //minPadding: 0.2,
            //maxPadding: 0.2,
            //maxZoom: 60,
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                month: '%e. %b',
                year: '%Y'
            },
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            gridLineColor: 'transparent',
            title: {
                text: 'Aggregated CX Score'
            },
            //minPadding: 0.2,
            //maxPadding: 0.2,
            //maxZoom: 60,
            plotLines: [{
                value: 0,
                width: 0,
                color: '#808080'
            }]
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        plotOptions: {
            series: {
                lineWidth: 1,
            }
        },
        series: [{
            data: cxScoreData
        }]
    }

    const [intentDateCategory, setIntentDateCategory] = useState(null);
    const [aggregatedCustomerIntentData, setAggregatedCustomerIntentData] = useState([])


    /**
     * Fetch Intent Data for Home Page
     */
    function fetchIntentData() {


        var today = new Date();
        var endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - 180);
        var startDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // console.log(start_date, end_date)

        services.get(`api/report/${startDate}/${endDate}/customer_intent/`).then(res => {
            console.log(res);
            // setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                // setError('Connection Error');
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }

                    var p = []
                    var n = []
                    var d = []
                    res.intent.map(item => {
                        p.push(item.Positive)
                        n.push(item.Negative)
                        d.push(item.call_date)
                    })
                    setAggregatedCustomerIntentData([p, n]);
                    setIntentDateCategory(d);
                }
                catch (e) {
                    // setError(e);
                }
            }
        })
    }


    /**
     * Customer Intent 
     */
    const aggregatedCustomerIntentOptions = {

        chart: {
            type: 'column',
            height: (8 / 19 * 100) + '%'
        },

        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        xAxis: {
            gridLineWidth: 0,
            categories: intentDateCategory
        },
        yAxis: {
            // gridLineWidth: 0,
            gridLineColor: 'transparent',

        },
        yAxis: [{
            className: 'highcharts-color-0',
            title: {
                text: 'Positive Intent'
            }
        }, {
            className: 'highcharts-color-1',
            opposite: true,
            title: {
                text: 'Negative Intent'
            }
        }],

        plotOptions: {
            column: {
                borderRadius: 5
            }
        },

        series: [{
            data: aggregatedCustomerIntentData[0],
            name: 'Positive'
        }, {
            data: aggregatedCustomerIntentData[1],
            name: 'Negative',
            yAxis: 1
        }]

    }

    const [recentCallPending, setRecentCallPending] = useState(true);
    const [recentCallError, setRecentCallError] = useState(null);



    /**
     * Fetch recent 5 Calls from API to display in home page
     */

    function fetchRecentCall() {
        setRecentCallPending(true);
        setRecentCallError(null);
        setRecentCalls(null);
        services.get('/api/call/home_page/recent_calls/').then(res => {

            if (res == 'TypeError: Failed to fetch') {
                setRecentCallPending(false);
                setRecentCallError("Connection Error");
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setRecentCallPending(false);
                    setRecentCalls(res);
                }
                catch (e) {
                    setRecentCallError(e);
                }
            }
        })
    }

    const [managerCommentPending, setManagerCommentPending] = useState(true);
    const [managerCommentError, setManagerCommentError] = useState(null);

    /**
     * Fetch Manager Comment // Call Review to display in home page
     */

    function fetchManagerComment() {
        setManagerComment(null);
        setManagerCommentPending(true);
        setManagerCommentError('');
        services.get('/api/call/home_page/managers_comments/').then(res => {
            if (res == 'TypeError: Failed to fetch') {
                setManagerCommentPending(false);
                setManagerCommentError("Connection Error");
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setManagerCommentPending(false);
                    setManagerComment(res);
                }
                catch (e) {
                    setManagerCommentError(e);
                }
            }
        })
    }

    const [opportunityPending, setOpportunityPending] = useState(true);
    const [opportunityError, setOpportunityError] = useState(null);
    /**
     * Fetch recent 5 opportunities to display in frontend
     */

    function fetchOpportunities() {
        setOpportunityPending(true);
        setOpportunityError('');
        setLeadStatus(null);
        services.get('/api/call/home_page/lead_status/').then(res => {
            if (res == 'TypeError: Failed to fetch') {
                setOpportunityPending(false);
                setOpportunityError("Connection Error");
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setOpportunityPending(false);
                    setLeadStatus(res);
                }
                catch (e) {
                    setOpportunityError(e);
                }
            }
        })
    }

    const [serviceRequestPending, setServiceRequestPending] = useState(true);
    const [serviceRequestError, setServiceRequestError] = useState(null);

    /**
     * Fetch recent 5 service requests to display in frontend
     */
    function fetchServiceRequest() {
        setServiceRequestError('');
        setServiceRequestPending(true);
        setServiceRequestStatus(null);
        services.get('/api/call/home_page/service_request_status/').then(res => {
            if (res == 'TypeError: Failed to fetch') {
                setServiceRequestPending(false);
                setServiceRequestError("Connection Error");
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setServiceRequestPending(false);
                    setServiceRequestStatus(res);
                }
                catch (e) {
                    setServiceRequestError(e);
                }
            }
        })
    }


    const [pendingTaskPending, setPendingTaskPending] = useState(true);
    const [pendingTaskError, setPendingTaskError] = useState(null);
    /**
     * Fetch Pending tasks from API
     */
    function fetchPendingTask() {
        setPendingTaskPending(true);
        setPendingTaskError('');
        setPendingTask(null);
        services.get('/api/task/recent_tasks/').then(res => {
            if (res == 'TypeError: Failed to fetch') {
                setPendingTaskPending(false);
                setPendingTaskError("Connection Error");
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setPendingTaskPending(false);
                    setPendingTask(res);
                }
                catch (e) {
                    setPendingTaskError(e);
                }

            }
        })
    }


    const [callBackPending, setCallBackPending] = useState(true);
    const [callBackError, setCallBackError] = useState(null);

    /**
     * Fetch Call back requests
     */
    function fetchCallBackRequests() {
        setCallBackPending(true);
        setRecentCallError('');
        setCallBack(null);
        services.get('api/call/home_page/call_back_remainders/').then(res => {
            if (res == 'TypeError: Failed to fetch') {
                setCallBackPending(false);
                setCallBackError("Connection Error");
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setCallBackPending(false);
                    setCallBack(res);
                }
                catch (e) {
                    setCallBackError(e);
                }

            }
        })
    }


    const [fullScript, setFullScript] = useState('')
    const [fullScriptPending, setFullScriptPending] = useState(true);
    const [fullScriptError, setFullScriptError] = useState(null);
    /**
     * Fetch Full Script info
     */
    function fetchFullScriptData() {
        setFullScriptError('');
        setFullScript('');
        setFullScriptPending(true);
        services.get(`/api/call_quality/manage_full_script/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                setFullScriptPending(false);
                setFullScriptError("Connection Error");
            }
            else {
                try {
                    setFullScript(res['FullScript']);
                    setFullScriptPending(false);
                    setFullScriptError('');
                } catch { }
            }
        })
    }


    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />

            <section className="page-body">
                <div className="section-one clearfix">
                    <div className="container-fluid">
                        <Masonry
                            breakpointCols={2}
                            className="my-masonry-grid"
                            columnClassName="my-masonry-grid_column"
                        >
                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ minHeight: "50px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <i className="fa fa-phone" aria-hidden="true"></i> &nbsp;Recent Calls</label>
                                    </div>
                                    <div style={{ minHeight: "4px", overflow: "auto" }}>
                                        <div className="accordion">

                                            <div className="call-table" style={{ minHeight: "10px" }}>
                                                <table className="ss">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                <p>
                                                                    Call Date
                                                                </p>

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
                                                    <tbody>

                                                        {
                                                            recentCalls &&
                                                            recentCalls.map(call => (
                                                                <tr className="tableRow" key={call._id}>
                                                                    <td><a>{call._date}</a></td>
                                                                    <td>{call._customer_first_name} &nbsp; {call._customer_last_name}</td>
                                                                    <td><a>{call._product_name}</a></td>
                                                                    <td>{call._call_type}</td>
                                                                    <td>
                                                                        {call._sentiment > 0 ?
                                                                            <p className="red" style={{ color: "green", }}>
                                                                                <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                                            <p className="red" style={{ color: "red", }}>
                                                                                <i className="fa fa-minus-circle" aria-hidden="true" /></p>
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {call._intent > 0 ?
                                                                            <p className="red" style={{ color: "green", }}>
                                                                                <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                                            <p className="red" style={{ color: "red", }}>
                                                                                <i className="fa fa-minus-circle" aria-hidden="true" /></p>
                                                                        }
                                                                    </td>
                                                                </tr>


                                                            ))
                                                        }



                                                    </tbody>
                                                </table>
                                                {
                                                    recentCallPending &&
                                                    <div style={{ textAlign: "center" }}>
                                                        <ClipLoader color="#2056FF" size="50px" />
                                                    </div>
                                                }
                                                {
                                                    recentCallError &&
                                                    <div style={{ textAlign: "center" }}>
                                                        <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                                            {
                                                                recentCallError === 'Connection Error' &&
                                                                <RiSignalWifiErrorFill />
                                                            }
                                                            {
                                                                recentCallError !== 'Connection Error' &&
                                                                <BiError />
                                                            }
                                                            {recentCallError}
                                                        </p>
                                                    </div>
                                                }
                                                {
                                                    recentCalls &&
                                                    recentCalls.length === 0 &&
                                                    <div style={{ fontSize: "20px", textAlign: "center" }}>
                                                        <MdAddIcCall />
                                                        <p>No Records Found</p>
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ minHeight: "50px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <MdIntegrationInstructions /> &nbsp;Call Script Campaign</label>
                                    </div>
                                    <div style={{ minHeight: "4px", overflow: "auto" }}>
                                        <div className="accordion">

                                            <div className="call-table" style={{ minHeight: "10px" }}>
                                                {
                                                    !fullScriptPending &&
                                                    fullScriptError === '' &&
                                                    <div className="view-list" >

                                                        <ul className="clearfix" style={{ paddingTop: "20px" }}>
                                                            <div>
                                                                <>
                                                                    {/* <RiChatVoiceLine color="green" /> */}
                                                                    <div style={{ padding: "5px", fontSize: "18px", color: "black", whiteSpace: "pre-wrap" }}>{fullScript}</div><br />
                                                                </>

                                                            </div>
                                                            <div style={{ paddingTop: "20px" }}>
                                                                {/* <a onClick={() => setShowPhraseAddModal(true)}> <b><AiOutlinePlus size="30" color="green" /></b></a> */}
                                                            </div>
                                                        </ul>
                                                    </div>
                                                }
                                                {
                                                    fullScriptPending &&
                                                    <div style={{ textAlign: "center" }}>
                                                        <ClipLoader color="#2056FF" size="50px" />
                                                    </div>
                                                }
                                                {
                                                    setFullScriptError === '' &&
                                                    <div style={{ textAlign: "center" }}>
                                                        <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                                            {
                                                                fullScriptError === 'Connection Error' &&
                                                                <RiSignalWifiErrorFill />
                                                            }
                                                            {
                                                                fullScriptError !== 'Connection Error' &&
                                                                <BiError />
                                                            }
                                                            {fullScriptError}
                                                        </p>
                                                    </div>
                                                }
                                            </div>




                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ minHeight: "50px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <i className="fa fa-tasks" aria-hidden="true"></i> &nbsp;Pending Tasks</label>
                                    </div>
                                    <div style={{ paddingBottom: "10px", minHeight: "40px", overflow: "auto", overflowX: "hidden" }}>
                                        <div className="accordion">


                                            {
                                                pendingTask &&
                                                pendingTask.map((task) => (
                                                    <div key={task.id} className="row dataRow" style={{ paddingLeft: "25px", paddingTop: "10px", paddingRight: "25px" }}>
                                                        <div className="col-md-1">
                                                            <div className="star" style={{ background: "green" }}>
                                                                <i className="fa fa-tasks" aria-hidden="true"></i>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-5">
                                                            <div className="sat-content">
                                                                <h3>{task.title}</h3>
                                                                <label>{task.priority} Priority</label>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3" style={{ fontSize: "16px" }}>
                                                            <i style={{ color: 'green' }} className="fa fa-user" aria-hidden="true"></i> &nbsp;
                                                    <a style={{ color: 'black' }}>{task.created_by__first_name} &nbsp; {task.created_by__last_name}</a>
                                                        </div>

                                                        <div className="col-md-3" style={{ fontSize: "16px" }}>
                                                            <i style={{ color: "red" }} className="fa fa-calendar-check-o" aria-hidden="true"></i> &nbsp;
                                                    <a style={{ color: 'black' }}>{task.creation_date.substring(0, 10)}</a>
                                                        </div>
                                                    </div>

                                                ))
                                            }

                                            {
                                                pendingTaskPending &&
                                                <div style={{ textAlign: "center" }}>
                                                    <ClipLoader color="#2056FF" size="50px" />
                                                </div>
                                            }
                                            {
                                                pendingTaskError &&
                                                <div style={{ textAlign: "center" }}>
                                                    <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                                        {
                                                            pendingTaskError === 'Connection Error' &&
                                                            <RiSignalWifiErrorFill />
                                                        }
                                                        {
                                                            pendingTaskError !== 'Connection Error' &&
                                                            <BiError />
                                                        }
                                                        {pendingTaskError}
                                                    </p>
                                                </div>
                                            }
                                            {
                                                pendingTask &&
                                                pendingTask.length === 0 &&
                                                <div style={{ fontSize: "20px", textAlign: "center" }}>
                                                    <BiTaskX />
                                                    <p>No Pending Task </p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ minHeight: "50px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <i className="fa fa-bell" aria-hidden="true"></i> &nbsp;Callback Reminders</label>
                                    </div>
                                    <div style={{ paddingBottom: "10px", minHeight: "40px", overflow: "auto", overflowX: "hidden" }}>
                                        <div style={{ paddingLeft: "25px", paddingRight: "25px" }}>

                                            {
                                                callBack &&
                                                callBack.map(cb => (
                                                    <div className="row dataRow" style={{ padding: "5px" }}>
                                                        <div className="col-md-1">
                                                            <div className="star" style={{ background: "blue" }}>
                                                                <i className="fa fa-bell" aria-hidden="true"></i>
                                                            </div>
                                                        </div>


                                                        <div className="col-md-3" style={{ fontSize: "16px" }}>

                                                            <p style={{ color: 'black' }}> <i style={{ color: 'green' }} className="fa fa-user" aria-hidden="true"></i> &nbsp;{cb.customer__first_name}&nbsp;{cb.customer__last_name}</p>
                                                            <label>{cb.customer__contact_number}</label>
                                                        </div>


                                                        <div className="col-md-3" style={{ fontSize: "16px" }}>

                                                            <label>{cb.product__title}</label>
                                                        </div>

                                                        <div className="col-md-3" style={{ fontSize: "16px" }}>
                                                            <i style={{ color: "red" }} className="fa fa-calendar-check-o" aria-hidden="true"></i> &nbsp;
                                                    <a style={{ color: 'black' }}>{cb.date__date}</a>
                                                        </div>


                                                        <div className="col-md-2" style={{ fontSize: "16px" }}>
                                                            <i style={{ color: "red" }} className="fa fa-clock-o" aria-hidden="true"></i> &nbsp;
                                                    <a style={{ color: 'black' }}>{cb.date__time}</a>
                                                        </div>


                                                    </div>


                                                ))
                                            }



                                        </div>

                                        {
                                            callBackPending &&
                                            <div style={{ textAlign: "center" }}>
                                                <ClipLoader color="#2056FF" size="50px" />
                                            </div>
                                        }
                                        {
                                            callBackError &&
                                            <div style={{ textAlign: "center" }}>
                                                <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                                    {
                                                        callBackError === 'Connection Error' &&
                                                        <RiSignalWifiErrorFill />
                                                    }
                                                    {
                                                        callBackError !== 'Connection Error' &&
                                                        <BiError />
                                                    }
                                                    {callBackError}
                                                </p>
                                            </div>
                                        }
                                        {
                                            callBack &&
                                            callBack.length === 0 &&
                                            <div style={{ fontSize: "20px", textAlign: "center" }}>
                                                <BiCommentAdd />
                                                <p>No Records Found</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ minHeight: "50px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <i className="fa fa-comment" aria-hidden="true"></i>&nbsp; Manager Comment</label>
                                    </div>
                                    <div className="" style={{ paddingBottom: "10px", minHeight: "40px", overflow: "auto", overflowX: "hidden" }}>
                                        <div style={{ paddingLeft: "25px", paddingRight: "25px" }}>

                                            {
                                                managerComment &&
                                                managerComment.map((comment) => (
                                                    <div key={comment.id} className="row dataRow" style={{ paddingLeft: "5px", paddingTop: "5px", paddingBottom: "5px", paddingRight: "5px" }}>
                                                        <div className="col-md-1">
                                                            <div className="star">
                                                                <i className="fa fa-commenting" aria-hidden="true"></i>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8">
                                                            <div className="sat-content">
                                                                <h3>{comment.comment}</h3>
                                                                <label>{comment.commented_by__first_name}&nbsp;{comment.commented_by__last_name}</label>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-2">
                                                            <i className="fa fa-calendar" aria-hidden="true"></i>&nbsp;
                                                        <a style={{ fontSize: "15px" }}>{comment.date__date}</a><br />
                                                            <i className="fa fa-phone-square" aria-hidden="true"></i>&nbsp;
                                                        <a style={{ fontSize: "15px" }}>{comment.call__call_reference}</a>
                                                        </div>
                                                        <div className="col-md-1">
                                                            <i className="fa fa-info-circle" aria-hidden="true"></i>
                                                        </div>

                                                    </div>

                                                ))
                                            }


                                        </div>
                                        {
                                            managerCommentPending &&
                                            <div style={{ textAlign: "center" }}>
                                                <ClipLoader color="#2056FF" size="50px" />
                                            </div>
                                        }
                                        {
                                            managerCommentError &&
                                            <div style={{ textAlign: "center" }}>
                                                <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                                    {
                                                        managerCommentError === 'Connection Error' &&
                                                        <RiSignalWifiErrorFill />
                                                    }
                                                    {
                                                        managerCommentError !== 'Connection Error' &&
                                                        <BiError />
                                                    }
                                                    {managerCommentError}
                                                </p>
                                            </div>
                                        }
                                        {
                                            managerComment &&
                                            managerComment.length === 0 &&
                                            <div style={{ fontSize: "20px", textAlign: "center" }}>
                                                <BiCommentAdd />
                                                <p>No Records Found</p>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ minHeight: "50px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <i className="fa fa-snowflake-o" aria-hidden="true"></i> &nbsp;Opportunity Status</label>
                                    </div>
                                    <div style={{ minHeight: "40px", overflow: "auto" }}>
                                        <div className="accordion">

                                            <div className="call-table" style={{ minHeight: "10px" }}>
                                                <table className="ss">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                <p>
                                                                    Reference
                                                                </p>

                                                            </th>
                                                            <th>
                                                                <p>Customer</p>
                                                            </th>
                                                            <th>
                                                                <p>Product</p>
                                                            </th>
                                                            <th>
                                                                <p>Status</p>

                                                            </th>
                                                            <th>
                                                                <p>Sentiments</p>

                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        {
                                                            leadStatus &&
                                                            leadStatus.map(lead => (
                                                                <tr key={lead._id} className="tableRow">
                                                                    <td><a>{lead.call__call_reference}</a></td>
                                                                    <td>{lead.call__customer__first_name}&nbsp;{lead.call__customer__last_name}</td>
                                                                    <td><a>{lead.product__title}</a></td>
                                                                    <td>{lead.review_status}</td>
                                                                    <td>
                                                                        {lead.call__customer_sentiment > 0 ?
                                                                            <p className="red" style={{ color: "green", }}>
                                                                                <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                                            <p className="red" style={{ color: "red", }}>
                                                                                <i className="fa fa-minus-circle" aria-hidden="true" /></p>
                                                                        }
                                                                    </td>
                                                                </tr>

                                                            ))
                                                        }


                                                    </tbody>
                                                </table>
                                            </div>
                                            {
                                                opportunityPending &&
                                                <div style={{ textAlign: "center" }}>
                                                    <ClipLoader color="#2056FF" size="50px" />
                                                </div>
                                            }
                                            {
                                                opportunityError &&
                                                <div style={{ textAlign: "center" }}>
                                                    <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                                        {
                                                            opportunityError === 'Connection Error' &&
                                                            <RiSignalWifiErrorFill />
                                                        }
                                                        {
                                                            opportunityError !== 'Connection Error' &&
                                                            <BiError />
                                                        }
                                                        {opportunityError}
                                                    </p>
                                                </div>
                                            }
                                            {
                                                leadStatus &&
                                                leadStatus.length === 0 &&
                                                <div style={{ fontSize: "20px", textAlign: "center" }}>
                                                    <VscGitPullRequestCreate />
                                                    <p>No Records Found</p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ minHeight: "50px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <i className="fa fa-superpowers" aria-hidden="true"></i> &nbsp;Service Request Status</label>
                                    </div>
                                    <div style={{ minHeight: "40px", overflow: "auto" }}>
                                        <div className="accordion">

                                            <div className="call-table" style={{ minHeight: "10px" }}>
                                                <table className="ss">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                <p>
                                                                    Reference
                                                                </p>

                                                            </th>
                                                            <th>
                                                                <p>Customer</p>
                                                            </th>
                                                            <th>
                                                                <p>Product</p>
                                                            </th>
                                                            <th>
                                                                <p>Status</p>

                                                            </th>
                                                            <th>
                                                                <p>Sentiments</p>

                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        {
                                                            serviceRequestStatus &&
                                                            serviceRequestStatus.map(sr => (
                                                                <tr key={sr._id} className="tableRow">
                                                                    <td><a>{sr.call__call_reference}</a></td>
                                                                    <td>{sr.call__customer__first_name}&nbsp;{sr.call__customer__last_name}</td>
                                                                    <td><a>{sr.product__title}</a></td>
                                                                    <td>{sr.review_status}</td>
                                                                    <td>
                                                                        {sr.call__customer_sentiment > 0 ?
                                                                            <p className="red" style={{ color: "green", }}>
                                                                                <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                                            <p className="red" style={{ color: "red", }}>
                                                                                <i className="fa fa-minus-circle" aria-hidden="true" /></p>
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }



                                                    </tbody>
                                                </table>
                                            </div>
                                            {
                                                serviceRequestPending &&
                                                <div style={{ textAlign: "center" }}>
                                                    <ClipLoader color="#2056FF" size="50px" />
                                                </div>
                                            }
                                            {
                                                serviceRequestError &&
                                                <div style={{ textAlign: "center" }}>
                                                    <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                                        {
                                                            serviceRequestError === 'Connection Error' &&
                                                            <RiSignalWifiErrorFill />
                                                        }
                                                        {
                                                            serviceRequestError !== 'Connection Error' &&
                                                            <BiError />
                                                        }
                                                        {serviceRequestError}
                                                    </p>
                                                </div>
                                            }
                                            {
                                                serviceRequestStatus &&
                                                serviceRequestStatus.length === 0 &&
                                                <div style={{ fontSize: "20px", textAlign: "center" }}>
                                                    <VscGitPullRequestCreate />
                                                    <p>No Records Found</p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ height: "450px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <i className="fa fa-area-chart" aria-hidden="true"></i> &nbsp;CX Score Trend</label>
                                    </div>
                                    <div style={{ height: "390px", overflow: "auto", overflowX: "hidden" }}>
                                        <div className="accordion">
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={cxTrendOptions}
                                            />

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "10px" }}>
                                <div className="assistant" style={{ height: "450px" }}>
                                    <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                                        <label style={{ fontSize: "20px", color: "#271078" }}> <i className="fa fa-bar-chart" aria-hidden="true"></i> &nbsp;Intent Analysis</label>
                                    </div>
                                    <div style={{ height: "390px", overflow: "auto", overflowX: "hidden" }}>
                                        <div className="accordion">

                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={aggregatedCustomerIntentOptions}
                                            />

                                        </div>
                                    </div>
                                </div>
                            </div>

                        </Masonry>

                    </div>
                </div>
            </section>
            <Footer />
        </div >
    );
}

export default Home;