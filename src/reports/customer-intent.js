import Header from "../header/header";
import Footer from "../footer/footer";
import NavBar from "../nav/nav-bar";
import ReportNav from "./report-nav";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { faCommentsDollar } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Service from './../webservice/http';
import { useHistory } from "react-router-dom";


const CustomerIntentReport = () => {
    const history = useHistory();
    const services = new Service();

    const [showRealData, setShowRealData] = useState(true);
    const [dateDifference, setDateDifference] = useState(7);


    /**
        * Fetch configuration from backend and decide wheather to show dummy data or real data
        */
    function fetchDataConfig() {
        services.get('/api/appconfig/dummy_data_api/').then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                // setError('Connection Error');
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    res.map(item => {
                        if (item.page === 'Report') {
                            if (item.status == true) {
                                console.log('===============')
                                setShowRealData(true);
                                // fetchData();
                                // return;
                            }
                            else {
                                console.log("----------------")
                                setShowRealData(false);
                                // chnageData();
                                // return;
                            }
                        }
                    })
                }
                catch (e) {
                    // setError(e);
                    console.log(e);
                }
            }
        })
    }

    const [displayDateCategory, setDisplayDateCategory] = useState(null);

    /**
     * Fetch Customer intent report data
     */
    function fetchData() {


        var today = new Date();
        var endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - dateDifference);
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
                    setCustomerIntentData([
                        ['Positive', res.positive_intent],
                        ['Negative', res.negative_intent],
                    ]);

                    var pd = []
                    res.product_segment.map(item => {
                        pd.push([item.product, item.count])
                    })
                    setCallDistributionData(pd);

                    var p = []
                    var n = []
                    var d = []
                    res.intent.map(item => {
                        p.push(item.Positive)
                        n.push(item.Negative)
                        d.push(item.call_date)
                    })
                    setAggregatedCustomerIntentData([p, n]);
                    setDisplayDateCategory(d);
                    setManagerCommentData(
                        {
                            "count": res.comment.count,
                            "change": res.comment.change
                        }
                    )

                    setOpportunityData(
                        {
                            "count": res.opportunity.count,
                            "change": res.opportunity.change
                        }
                    )

                    setServiceRequestData(
                        {
                            "count": res.service_request.count,
                            "change": res.service_request.change
                        }
                    )
                }
                catch (e) {
                    // setError(e);
                }
            }
        })
    }

    useEffect(() => {
        fetchDataConfig();
    }, [])
    const [customerIntentData, setCustomerIntentData] = useState([]);

    const [callDistributionData, setCallDistributionData] = useState([]);

    const [aggregatedCustomerIntentData, setAggregatedCustomerIntentData] = useState([])

    const [managerCommentData, setManagerCommentData] = useState(
        {
            "count": 0,
            "change": 0
        }
    )

    const [opportunityData, setOpportunityData] = useState(
        {
            "count": 0,
            "change": 0
        }
    )

    const [serviceRequestData, setServiceRequestData] = useState(
        {
            "count": 0,
            "change": 0
        }
    )


    /**
     * Customer intent chart config
     */
    const customerIntentOptions = {

        chart: {
            type: 'pie',
            height: (6 / 16 * 100) + '%'
        },
        title: {
            text: 'Intent',
            align: 'center',
            verticalAlign: 'middle',
            y: 15
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.1f} %',
                    distance: -20,
                },
                showInLegend: true,
                size: '120%'
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'center',
            y: 50,
            layout: 'vertical'
        },
        series: [{
            name: 'Delivered amount',
            innerSize: '50%',
            data: customerIntentData
        }]
    }


    /**
     * call distribution pie chart config
     */
    const callDistributionOptions = {

        chart: {
            type: 'pie',
            height: (9 / 19 * 100) + '%'
        },
        title: {
            text: '',
            align: 'center',
            verticalAlign: 'middle',
            y: 15
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.1f} %',
                    distance: -20,
                },
                showInLegend: true,
                size: '120%'
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'center',
            y: 50,
            layout: 'vertical'
        },
        series: [{
            name: 'Delivered amount',
            data: callDistributionData
        }]
    }


    /**
     * aggregated customer intent bar chart config
     */
    const aggregatedCustomerIntentOptions = {

        chart: {
            type: 'column',
            height: (3 / 19 * 100) + '%'
        },

        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        xAxis: {
            gridLineWidth: 0,
            categories: displayDateCategory
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


    /**
     * change demo data based on changing day interval
     */

    function chnageData() {
        // if (showRealData === false) {
        if (dateDifference === '7') {
            setCustomerIntentData([
                ['Positive', 15],
                ['Negative', 9],
            ]);

            if (localStorage.getItem('critical_factor_module') === 'true') {
                setCallDistributionData([
                    ['Switch', 8],
                    ['Control', 3],
                    ['Engine', 10],
                    ['Assembly', 15]
                ]);
            }
            else {
                setCallDistributionData([
                    ['Credit Card', 8],
                    ['Saving Account', 3],
                    ['Insurance', 10],
                    ['Travel Card', 15]
                ]);
            }

            setAggregatedCustomerIntentData([
                [400, 415, 430, 390, 520, 450, 590],
                [300, 390, 500, 200, 200, 300, 400],
            ]);
            setManagerCommentData({
                "count": 438,
                "change": 3
            });
            setOpportunityData({
                "count": 200,
                "change": 6
            });
            setServiceRequestData({
                "count": 178,
                "change": -10
            });
        }

        if (dateDifference === '30') {
            setCustomerIntentData([
                ['Positive', 300],
                ['Negative', 250],
            ]);


            if (localStorage.getItem('critical_factor_module') === 'true') {
                setCallDistributionData([
                    ['Switch', 80],
                    ['Control', 180],
                    ['Engine', 200],
                    ['Assembly', 150]
                ]);
            }
            else {
                setCallDistributionData([
                    ['Credit Card', 80],
                    ['Saving Account', 180],
                    ['Insurance', 200],
                    ['Travel Card', 150]
                ]);
            }

            setAggregatedCustomerIntentData([
                [400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 300, 390, 500, 200, 200, 300, 400, 390, 520, 450, 590,],
                [300, 390, 500, 200, 200, 300, 400, 390, 500, 200, 200, 390, 500, 200, 200, 390, 500, 200, 200, 390, 390, 500, 200, 200, 390, 500, 200, 200, 390, 500, 200, 200,],
            ]);
            setManagerCommentData({
                "count": 2190,
                "change": -6
            });
            setOpportunityData({
                "count": 926,
                "change": 10
            });
            setServiceRequestData({
                "count": 925,
                "change": -15
            });
        }

        if (dateDifference === '90') {
            setCustomerIntentData([
                ['Positive', 800],
                ['Negative', 999],
            ]);

            if (localStorage.getItem('critical_factor_module') === 'true') {
                setCallDistributionData([
                    ['Switch', 380],
                    ['Control', 580],
                    ['Engine', 600],
                    ['Assembly', 350]
                ]);
            }
            else {
                setCallDistributionData([
                    ['Credit Card', 380],
                    ['Saving Account', 580],
                    ['Insurance', 600],
                    ['Travel Card', 350]
                ]);
            }

            setAggregatedCustomerIntentData([
                [400, 415, 430, 390, 520, 450, 590, 400, 590, 400, 415, 430, 390, 520, 450, 590, 300, 390, 500, 200, 200, 300, 400, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 300, 390, 500, 200, 200, 300, 400, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 300, 390, 500, 200, 200, 300, 400, 390, 520, 450, 590,],
                [300, 390, 500, 200, 200, 300, 400, 390, 200, 200, 390, 500, 200, 200, 390, 390, 500, 200, 200, 390, 500, 200, 200, 390, 500, 200, 200, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 300, 390, 500, 200, 200, 300, 400, 390, 520, 450, 590, 200, 200, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 400, 415, 430, 390, 520, 450, 590, 200, 520, 450, 590, 300, 390, 520, 450, 590,],
            ]);
            setManagerCommentData({
                "count": 6352,
                "change": -17
            });
            setOpportunityData({
                "count": 2672,
                "change": 18
            });
            setServiceRequestData({
                "count": 2588,
                "change": 10
            });
        }
        // }
    }


    useEffect(() => {
        if (showRealData == true)
            fetchData()
        else
            chnageData()
    }, [dateDifference, showRealData])

    // useEffect(() => {
    //     if (showRealData == true)
    //         fetchData()
    //     else {
    //         console.log("???????????????????????????")
    //         chnageData()
    //         console.log(customerIntentData)
    //     }
    // }, [showRealData])


    /**
     * Change Report interval
     * @param {*} e Event
     */
    const changeReportInterval = (e) => {
        var day = e.target.id;
        setDateDifference(day)

    }


    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />

            <div>
                <div className="container-fluid">
                    <div className="my-call">


                        <div className="side-panel-with-table clearfix">
                            <ReportNav />

                            <div className="call-table">
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="pannel-heading clearfix">
                                                    <div className="pannel-heading-icon"><i class="fa fa-tachometer" aria-hidden="true"></i></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Customer Intent </h3>
                                                        <p>Track the overall Customer Intent and the impact of CX Score over time</p>

                                                    </div>
                                                </div>
                                            </div>



                                            <div className="col-lg-6">
                                                <div className="pannel-nav clearfix">
                                                    <ul className="clearfix">
                                                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                                            <label className="btn btn-default active" id="7" onClick={changeReportInterval}>
                                                                <input type="radio" name="options" autoComplete="off" /> 7 Days</label>
                                                            <label className="btn btn-default" id="30" onClick={changeReportInterval}>
                                                                <input type="radio" name="options" autoComplete="off" /> 30 Days </label>
                                                            <label className="btn btn-default" id="90" onClick={changeReportInterval}>
                                                                <input type="radio" name="options" autoComplete="off" /> 90 Days</label>
                                                        </div>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>




                                <div className="row">

                                    <div className="col-lg-5 col-md-5" style={{ paddingBottom: "5px", }}>
                                        <div className="all-list" style={{ height: "310px" }}>
                                            <label>Customer Intent</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={customerIntentOptions}
                                            />
                                        </div>
                                    </div>



                                    <div className="col-lg-4 col-md-4" style={{ paddingBottom: "5px", }}>
                                        <div className="all-list" style={{ height: "310px" }}>
                                            <label>Call Distribution (by Product)</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={callDistributionOptions}
                                            />
                                        </div>
                                    </div>




                                    <div className="col-lg-3 col-md-3" style={{ paddingBottom: "5px" }}>

                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "13px" }}>
                                            <div className="all-list" style={{ height: "95px" }}>
                                                <div className="pannel-heading-icon"><i className="fa fa-comment" aria-hidden="true" /></div>
                                                <div className="row">
                                                    <div className="col-md-6" style={{ textAlign: "center" }}>
                                                        <a style={{ fontSize: "30px" }}>{managerCommentData['count']}</a><br />
                                                        <label>Manager Comment</label>
                                                    </div>
                                                    <div className="col-md-4" style={{ textAlign: "center" }}>
                                                        {
                                                            managerCommentData['change'] >= 0 &&
                                                            <a style={{ fontSize: "25px", color: "green" }}> {managerCommentData['change']}% <i className="fa fa-arrow-up" aria-hidden="true" /></a>
                                                        }
                                                        {
                                                            managerCommentData['change'] < 0 &&
                                                            <a style={{ fontSize: "25px", color: "red" }}> {managerCommentData['change']}% <i className="fa fa-arrow-down" aria-hidden="true" /></a>
                                                        }
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "13px" }}>
                                            <div className="all-list" style={{ height: "95px" }}>
                                                <div className="pannel-heading-icon"><i className="fa fa-users" aria-hidden="true" /></div>
                                                <div className="row">
                                                    <div className="col-md-6" style={{ textAlign: "center" }}>
                                                        <a style={{ fontSize: "30px" }}>{opportunityData['count']}</a><br />
                                                        <label>Opportunity</label>
                                                    </div>
                                                    <div className="col-md-4" style={{ textAlign: "center" }}>
                                                        {
                                                            opportunityData['change'] >= 0 &&
                                                            <a style={{ fontSize: "25px", color: "green" }}> {opportunityData['change']}% <i className="fa fa-arrow-up" aria-hidden="true" /></a>
                                                        }

                                                        {
                                                            opportunityData['change'] < 0 &&
                                                            <a style={{ fontSize: "25px", color: "red" }}> {opportunityData['change']}% <i className="fa fa-arrow-down" aria-hidden="true" /></a>
                                                        }
                                                    </div>
                                                </div>

                                            </div>
                                        </div><div className="row" style={{ paddingBottom: "5px", paddingRight: "13px" }}>
                                            <div className="all-list" style={{ height: "95px" }}>
                                                <div className="pannel-heading-icon"><i className="fa fa-cog" aria-hidden="true" /></div>
                                                <div className="row">
                                                    <div className="col-md-6" style={{ textAlign: "center" }}>
                                                        <a style={{ fontSize: "30px" }}>{serviceRequestData['count']}</a><br />
                                                        <label>Service Request</label>
                                                    </div>
                                                    <div className="col-md-4" style={{ textAlign: "center" }}>
                                                        {
                                                            serviceRequestData['change'] >= 0 &&
                                                            <a style={{ fontSize: "25px", color: "green" }}> {serviceRequestData['change']}% <i className="fa fa-arrow-up" aria-hidden="true" /></a>
                                                        }
                                                        {
                                                            serviceRequestData['change'] < 0 &&
                                                            <a style={{ fontSize: "25px", color: "red" }}> {serviceRequestData['change']}% <i className="fa fa-arrow-down" aria-hidden="true" /></a>
                                                        }
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                    </div>



                                </div>



                                <div className="row">
                                    <div className="col-lg-12 col-md-12" style={{ paddingBottom: "25px", }}>
                                        <div className="all-list">
                                            <label>Aggregated Customer Intent Trend</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={aggregatedCustomerIntentOptions}
                                            />
                                        </div>
                                    </div>
                                </div>



                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div >
    );
}

export default CustomerIntentReport;