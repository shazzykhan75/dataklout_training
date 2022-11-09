import Header from "../header/header";
import Footer from "../footer/footer";
import NavBar from "../nav/nav-bar";
import ReportNav from "./report-nav";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from "react";
import wordCloud from "highcharts/modules/wordcloud.js";
import Service from './../webservice/http';
import { useHistory } from "react-router-dom";

const ServiceRequestReport = () => {
    const history = useHistory();
    const services = new Service();

    const [showRealData, setShowRealData] = useState(false);
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
     * Fetch Service request report data
     */
    function fetchData() {


        var today = new Date();
        var endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - dateDifference);
        var startDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // console.log(start_date, end_date)

        services.get(`api/report/${startDate}/${endDate}/service_requests/`).then(res => {
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

                    var trend = []
                    res.day_wise_service_request_report.map(item => {
                        trend.push([item.date__date, item.Count])
                    })
                    setServicerequestTrendData(trend);
                    // setCriticalKeyword(res.critical_keywords)
                    // setConsumablesInsight(res.consumables_insight)

                    var owned = 0
                    var transfered = 0
                    var closed = 0
                    var open = 0
                    var inprogress = 0
                    var escalation = 0
                    res.service_request_segmentation.map(item => {
                        if (item.review_status === 'Pending') {
                            owned = owned + item.Count
                            open = item.Count
                        }
                        if (item.review_status === 'Inprogress') {
                            owned = owned + item.Count
                            inprogress = item.Count
                        }
                        if (item.review_status === 'Transferred') {
                            transfered = transfered + item.Count
                            escalation = item.Count
                        }
                        if (item.review_status === 'Serviced') {
                            owned = owned + item.Count
                            closed = item.Count
                        }
                    })

                    setServiceRequestData({
                        "total": owned + transfered,
                        "closed": [closed, Math.round(closed * 100 / (closed + open + inprogress + escalation))],
                        "open": [open, Math.round(open * 100 / (closed + open + inprogress + escalation))],
                        "inprogress": [inprogress, Math.round(inprogress * 100 / (closed + open + inprogress + escalation))],
                        "escalation": [escalation, Math.round(escalation * 100 / (closed + open + inprogress + escalation))]
                    })

                    var owned_p = Math.round(owned * 100 / (owned + transfered))
                    var transferred_p = 100 - owned_p
                    setOwonedData([
                        ['Owoned', owned_p],
                        ['', transferred_p],
                    ]);

                    seTransferredData([
                        ['Transferred', transferred_p],
                        ['', owned_p],
                    ]);

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

    const [day, setDay] = useState(7);

    /**
     * change report interval
     */
    const changeReportInterval = (e) => {
        var day = e.target.id;

        if (day === '7') {
            setDay(7);
            setDateDifference(7);
        }

        if (day === '30') {
            setDay(30);
            setDateDifference(30);
        }

        if (day === '90') {
            setDay(90);
            setDateDifference(90);
        }
    }

    const [serviceRequestData, setServiceRequestData] = useState({
        "total": 0,
        "closed": [0, 0],
        "open": [0, 0],
        "inprogress": [0, 0],
        "escalation": [0, 0]
    });

    const [owonedData, setOwonedData] = useState([
        ['Owoned', 74],
        ['', 26],
    ]);

    const [transferredData, seTransferredData] = useState([
        ['Transferred', 26],
        ['', 74],
    ]);

    const [servicerequestTrendData, setServicerequestTrendData] = useState(null);

    /**
     * change demo data based on changing day interval
     */
    function changeDemoData() {
        var tempOppData = {}
        if (day === 7) {
            setServiceRequestData({
                "total": 184,
                "closed": [45, 24],
                "open": [47, 26],
                "inprogress": [51, 28],
                "escalation": [41, 22]
            });

            setOwonedData(
                [
                    ['Owoned', 74],
                    ['', 26],
                ]
            );

            seTransferredData([
                ['Transferred', 26],
                ['', 74],
            ]);
        }
        if (day === 30) {
            setServiceRequestData({
                "total": 924,
                "closed": [232, 25],
                "open": [238, 26],
                "inprogress": [215, 23],
                "escalation": [239, 26]
            });
            setOwonedData(
                [
                    ['Owoned', 77],
                    ['', 23],
                ]
            );

            seTransferredData([
                ['Transferred', 23],
                ['', 77],
            ]);
        }
        if (day === 90) {
            setServiceRequestData({
                "total": 2591,
                "closed": [651, 25],
                "open": [659, 25],
                "inprogress": [616, 24],
                "escalation": [665, 26]
            });
            setOwonedData(
                [
                    ['Owoned', 75],
                    ['', 25],
                ]
            );

            seTransferredData([
                ['Transferred', 25],
                ['', 75],
            ]);
        }



        var tempSRTrendData = [];
        var newDate = new Date();
        for (let i = 0; i < day; i++) {
            newDate = new Date();
            newDate.setDate(newDate.getDate() - i);
            tempSRTrendData.push([
                newDate,
                Math.floor(Math.random() * (65 - 10) + 10)
            ]);
        }
        setServicerequestTrendData(tempSRTrendData);
    }

    useEffect(() => {
        if (showRealData == true) {
            fetchData()
        }
        else {
            changeDemoData();
        }
    }, [day])


    /**
     * Service request trend chart config
     */
    const serviceRequestTrendOption = {
        chart: {
            type: 'column',
            height: (6 / 27.5 * 100) + '%'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'date',
            labels: {
                //rotation: -45,
                style: {
                    fontSize: '10px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        credits: {
            enabled: false
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            pointFormat: 'Service: <b>{point.y:.1f}</b>Date: <b>{point.x:.1f}</b>'
        },
        series: [{
            data: servicerequestTrendData
        }]
    }

    const owonedOption = {
        chart: {
            //plotBackgroundColor: null,
            //plotBorderWidth: 0,
            //plotShadow: false,
            type: 'pie',
            height: (7 / 16 * 100) + '%'
        },
        title: {
            text: 'Owoned',
            align: 'center',
            verticalAlign: 'middle',
            y: 50
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        credits: {
            enabled: false
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: false,
                    distance: -50,
                    style: {
                        fontWeight: 'bold',
                        color: 'white'
                    }
                },
                startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%'],
                size: '200%'
            }
        },
        series: [{
            type: 'pie',
            //name: 'Browser share',
            innerSize: '50%',
            data: owonedData
        }]
    }

    const transferredOption = {
        chart: {
            //plotBackgroundColor: null,
            //plotBorderWidth: 0,
            //plotShadow: false,
            type: 'pie',
            height: (7 / 16 * 100) + '%'
        },
        title: {
            text: 'Transferred',
            align: 'center',
            verticalAlign: 'middle',
            y: 50
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        credits: {
            enabled: false
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: false,
                    distance: -50,
                    style: {
                        fontWeight: 'bold',
                        color: 'white'
                    }
                },
                startAngle: -90,
                endAngle: 90,
                center: ['50%', '75%'],
                size: '200%'
            }
        },
        series: [{
            type: 'pie',
            //name: 'Browser share',
            innerSize: '50%',
            data: transferredData
        }]
    }

    wordCloud(Highcharts);

    Highcharts.seriesTypes.wordcloud.prototype.deriveFontSize = function (
        relativeWeight
    ) {
        var maxFontSize = 100;
        // Will return a fontSize between 0px and 25px.
        return Math.floor(maxFontSize * relativeWeight);
    };

    const criticalKeywordsData = Highcharts.reduce(
        ['like', 'thank', 'you', 'wonderful', 'great', 'product', 'go for', 'nice', 'satisfied'],
        function (arr, word) {
            var obj = Highcharts.find(arr, function (obj) {
                return obj.name === word;
            });
            if (obj) {
                obj.weight += 1;
            } else {
                obj = {
                    name: word,
                    weight: Math.ceil(Math.random() * 50)
                };
                arr.push(obj);
            }
            return arr;
        },
        []
    );


    /**
     * Ctitical keyword cordcloud config
     */
    const criticalKeywordOptions = {
        chart: {
            height: (6 / 30 * 100) + '%'
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        series: [
            {
                type: "wordcloud",
                data: criticalKeywordsData
            }
        ]
    };


    const opportunityIdentifierKeywordsData = Highcharts.reduce(
        ['worst', 'bad service', 'product', 'ever', 'unfortunately'],
        function (arr, word) {
            var obj = Highcharts.find(arr, function (obj) {
                return obj.name === word;
            });
            if (obj) {
                obj.weight += 1;
            } else {
                obj = {
                    name: word,
                    weight: Math.ceil(Math.random() * 50)
                };
                arr.push(obj);
            }
            return arr;
        },
        []
    );


    /**
     * Opportunity identifier keyword wordcloud config
     */
    const opportunityIdentifierKeywordOptions = {
        chart: {
            height: (6 / 30 * 100) + '%'
        },
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        series: [
            {
                type: "wordcloud",
                data: opportunityIdentifierKeywordsData
            }
        ]
    };


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
                                                    <div className="pannel-heading-icon"><i className="fa fa-superpowers" aria-hidden="true"></i></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Service Request </h3>
                                                        <p>Service Requests being handled, open and closed</p>

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

                                    <div className="col-lg-4 col-md-4" style={{ paddingBottom: "5px", }}>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "250px", textAlign: "center", verticalAlign: "middle", }}>
                                                <p style={{ fontSize: "50px", color: "#270086" }}><i className="fa fa-superpowers" aria-hidden="true"></i><br />{serviceRequestData['total']}</p>
                                                <p style={{ color: "#270086" }}>Tickets</p>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "90px", fontSize: "25px", color: "#270086" }}>
                                                <div className="col-lg-6 col-md-6">
                                                    Closed
                                               </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {serviceRequestData['closed'][0]}
                                                </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {serviceRequestData['closed'][1]} %
                                               </div>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "90px", fontSize: "25px", color: "#270086" }}>
                                                <div className="col-lg-6 col-md-6">
                                                    Open
                                               </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {serviceRequestData['open'][0]}
                                                </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {serviceRequestData['open'][1]} %
                                               </div>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "90px", fontSize: "25px", color: "#270086" }}>
                                                <div className="col-lg-6 col-md-6">
                                                    Inprogress
                                               </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {serviceRequestData['inprogress'][0]}
                                                </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {serviceRequestData['inprogress'][1]} %
                                               </div>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "90px", fontSize: "25px", color: "#270086" }}>
                                                <div className="col-lg-6 col-md-6">
                                                    Escalation
                                               </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {serviceRequestData['escalation'][0]}
                                                </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {serviceRequestData['escalation'][1]} %
                                               </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-8 col-md-8">
                                        <div className="row" style={{ paddingBottom: "7px", paddingRight: "14px", }}>
                                            <div className="all-list" style={{ height: "250px" }}>
                                                {
                                                    serviceRequestTrendOption &&
                                                    <HighchartsReact
                                                        highcharts={Highcharts}
                                                        options={serviceRequestTrendOption}
                                                    />
                                                }

                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-4 col-md-4">
                                                <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px" }}>
                                                    <div className="all-list" style={{ height: "185px", textAlign: "center", verticalAlign: "middle" }}>
                                                        <HighchartsReact
                                                            highcharts={Highcharts}
                                                            options={owonedOption}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px" }}>
                                                    <div className="all-list" style={{ height: "185px", textAlign: "center", verticalAlign: "middle" }}>
                                                        <HighchartsReact
                                                            highcharts={Highcharts}
                                                            options={transferredOption}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-8 col-md-8">
                                                <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px" }}>
                                                    <div className="all-list" style={{ height: "185px" }}>
                                                        <label>Top Servicing Keywords</label>
                                                        <HighchartsReact
                                                            highcharts={Highcharts}
                                                            options={criticalKeywordOptions}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row" >
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="all-list" style={{ height: "185px" }}>
                                                            <label>Positive Interection</label>
                                                            <HighchartsReact
                                                                highcharts={Highcharts}
                                                                options={opportunityIdentifierKeywordOptions}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="all-list" style={{ height: "185px" }}>
                                                            <label>Negative Interection</label>
                                                            <HighchartsReact
                                                                highcharts={Highcharts}
                                                                options={opportunityIdentifierKeywordOptions}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

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

export default ServiceRequestReport;