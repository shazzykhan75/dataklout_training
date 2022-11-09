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


const OpportynityReport = () => {
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
                                // changeDemoData();
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
     * Fetch opportunity report data
     */
    function fetchData() {


        var today = new Date();
        var endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - dateDifference);
        var startDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // console.log(start_date, end_date)

        services.get(`api/report/${startDate}/${endDate}/opportunities/`).then(res => {
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
                    res.day_wise_opportunity_report.map(item => {
                        trend.push([item.date__date, item.Count])
                    })
                    setOpportunityTrendData(trend);
                    setCriticalKeyword(res.critical_keywords)
                    setConsumablesInsight(res.consumables_insight)

                    var qualified = 0
                    var disqualified = 0
                    var win = 0
                    var pending = 0
                    var rejected = 0
                    var opportunity = 0
                    res.opportunity_segmentation.map(item => {
                        if (item.review_status === 'Working') {
                            qualified = qualified + item.Count
                            opportunity = item.Count
                        }
                        if (item.review_status === 'New') {
                            qualified = qualified + item.Count
                            pending = item.Count
                        }
                        if (item.review_status === 'Converted') {
                            qualified = qualified + item.Count
                            win = item.Count
                        }
                        if (item.review_status === 'Unqualified') {
                            disqualified = disqualified + item.Count
                            rejected = item.Count
                        }
                    })
                    var qualified_p = Math.round(qualified * 100 / (qualified + disqualified))
                    var disqualified_p = 100 - qualified_p
                    setQualifiedData([
                        ['Qualified', qualified_p],
                        ['', disqualified_p],
                    ])
                    setDisqualifiedData([
                        ['Disqualified', disqualified_p],
                        ['', qualified_p],
                    ])
                    setOpportunityData({
                        "total": win,
                        "opportunity": [opportunity, Math.round(opportunity * 100 / (opportunity + win + pending + rejected))],
                        "win": [win, Math.round(win * 100 / (opportunity + win + pending + rejected))],
                        "pending": [pending, Math.round(pending * 100 / (opportunity + win + pending + rejected))],
                        "rejected": [rejected, Math.round(rejected * 100 / (opportunity + win + pending + rejected))]
                    })
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
 * Change Report interval
 * @param {*} e Event
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

    const [opportunityData, setOpportunityData] = useState({
        "total": 0,
        "opportunity": [0, 0],
        "win": [0, 0],
        "pending": [0, 0],
        "rejected": [0, 0]
    });

    const [qualifiedData, setQualifiedData] = useState([]);

    const [disqualifiedData, setDisqualifiedData] = useState([]);

    const [opportunityTrendData, setOpportunityTrendData] = useState(null);


    /**
     * change demo data based on changing day interval
     */
    function changeDemoData() {
        var tempOppData = {}
        if (day === 7) {
            setOpportunityData({
                "total": 218,
                "opportunity": [49, 22],
                "win": [55, 25],
                "pending": [60, 28],
                "rejected": [54, 25]
            });

            setQualifiedData(
                [
                    ['Qualified', 67],
                    ['', 33],
                ]
            );

            setDisqualifiedData([
                ['Disqualified', 33],
                ['', 67],
            ]);
        }
        if (day === 30) {
            setOpportunityData({
                "total": 947,
                "opportunity": [247, 26],
                "win": [222, 23],
                "pending": [248, 26],
                "rejected": [230, 24]
            });
            setQualifiedData(
                [
                    ['Qualified', 68],
                    ['', 32],
                ]
            );

            setDisqualifiedData([
                ['Disqualified', 32],
                ['', 68],
            ]);
        }
        if (day === 90) {
            setOpportunityData({
                "total": 2690,
                "opportunity": [674, 25],
                "win": [690, 27],
                "pending": [663, 24],
                "rejected": [663, 24]
            });
            setQualifiedData(
                [
                    ['Qualified', 70],
                    ['', 30],
                ]
            );

            setDisqualifiedData([
                ['Disqualified', 30],
                ['', 70],
            ]);
        }



        var tempOppTrendData = [];
        var newDate = new Date();
        for (let i = 0; i < day; i++) {
            newDate = new Date();
            newDate.setDate(newDate.getDate() - i);
            tempOppTrendData.push([
                newDate,
                Math.floor(Math.random() * (65 - 10) + 10)
            ]);
        }
        setOpportunityTrendData(tempOppTrendData);
        setConsumablesInsight(['worst', 'bad service', 'product', 'ever', 'unfortunately']);
        setCriticalKeyword(['like', 'thank', 'you', 'wonderful', 'great', 'product', 'go for', 'nice', 'satisfied'])
    }

    useEffect(() => {
        if (showRealData == true) {
            fetchData()
        }
        else {
            changeDemoData();
        }
    }, [day])

    // useEffect(() => {
    //     if (showRealData == true) {
    //         fetchData()
    //     }
    //     else {
    //         changeDemoData();
    //     }
    // }, [])


    /**
     * Opportunity Trend chart config
     */
    const opportunityTrendOption = {
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
            pointFormat: 'Opportunity: <b>{point.y:.1f}</b>Date: <b>{point.x:.1f}</b>'
        },
        series: [{
            data: opportunityTrendData
        }]
    }


    /**
     * Qualified chart config
     */
    const qualifiedOption = {
        chart: {
            //plotBackgroundColor: null,
            //plotBorderWidth: 0,
            //plotShadow: false,
            type: 'pie',
            height: (7 / 16 * 100) + '%'
        },
        title: {
            text: 'Qualified',
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
            data: qualifiedData
        }]
    }

    /**\
     * Disqualified chart options
     */
    const disqualifiedOption = {
        chart: {
            //plotBackgroundColor: null,
            //plotBorderWidth: 0,
            //plotShadow: false,
            type: 'pie',
            height: (7 / 16 * 100) + '%'
        },
        title: {
            text: 'Disqualified',
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
            data: disqualifiedData
        }]
    }

    wordCloud(Highcharts);

    Highcharts.seriesTypes.wordcloud.prototype.deriveFontSize = function (
        relativeWeight
    ) {
        var maxFontSize = 25;
        // Will return a fontSize between 0px and 25px.
        return Math.floor(maxFontSize * relativeWeight);
    };

    const [consumablesInsight, setConsumablesInsight] = useState([])
    const [criticalKeyword, setCriticalKeyword] = useState([])

    const criticalKeywordsData = Highcharts.reduce(
        criticalKeyword,
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
     * Critical keyword word cloud config
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
        consumablesInsight,
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
     * Opportunity Identifier keyword wordcloud config
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
                                                    <div className="pannel-heading-icon"><i className="fa fa-snowflake-o" aria-hidden="true"></i></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Opportunity </h3>
                                                        <p>Opportunity generated and converted into Leads and wins</p>

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
                                                <p style={{ fontSize: "50px", color: "#270086" }}><i className="fa fa-snowflake-o" aria-hidden="true"></i><br />{opportunityData['total']}</p>
                                                <p style={{ color: "#270086" }}>Converted to Leads</p>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "90px", fontSize: "25px", color: "#270086" }}>
                                                <div className="col-lg-6 col-md-6">
                                                    Opportunities
                                               </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {opportunityData['opportunity'][0]}
                                                </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {opportunityData['opportunity'][1]} %
                                               </div>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "90px", fontSize: "25px", color: "#270086" }}>
                                                <div className="col-lg-6 col-md-6">
                                                    Wins
                                               </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {opportunityData['win'][0]}
                                                </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {opportunityData['win'][1]} %
                                               </div>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "90px", fontSize: "25px", color: "#270086" }}>
                                                <div className="col-lg-6 col-md-6">
                                                    Review Pending
                                               </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {opportunityData['pending'][0]}
                                                </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {opportunityData['pending'][1]} %
                                               </div>
                                            </div>
                                        </div>
                                        <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px", paddingLeft: "14px" }}>
                                            <div className="all-list" style={{ height: "90px", fontSize: "25px", color: "#270086" }}>
                                                <div className="col-lg-6 col-md-6">
                                                    Rejected
                                               </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {opportunityData['rejected'][0]}
                                                </div>
                                                <div className="col-lg-3 col-md-3">
                                                    {opportunityData['rejected'][1]} %
                                               </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-8 col-md-8">
                                        <div className="row" style={{ paddingBottom: "7px", paddingRight: "14px", }}>
                                            <div className="all-list" style={{ height: "250px" }}>
                                                {
                                                    opportunityTrendData &&
                                                    <HighchartsReact
                                                        highcharts={Highcharts}
                                                        options={opportunityTrendOption}
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
                                                            options={qualifiedOption}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px" }}>
                                                    <div className="all-list" style={{ height: "185px", textAlign: "center", verticalAlign: "middle" }}>
                                                        <HighchartsReact
                                                            highcharts={Highcharts}
                                                            options={disqualifiedOption}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-8 col-md-8">
                                                <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px" }}>
                                                    <div className="all-list" style={{ height: "185px" }}>
                                                        <label>Critical Keywords</label>
                                                        <HighchartsReact
                                                            highcharts={Highcharts}
                                                            options={criticalKeywordOptions}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="row" style={{ paddingBottom: "5px", paddingRight: "14px" }}>
                                                    <div className="all-list" style={{ height: "185px" }}>
                                                        <label>Lead Identifiers</label>
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
            <Footer />
        </div >
    );
}

export default OpportynityReport;