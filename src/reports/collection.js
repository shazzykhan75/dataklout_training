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
import { BsFillCollectionFill } from "react-icons/bs";
import { FaRupeeSign } from "react-icons/fa";
import { GiOnTarget } from "react-icons/gi";
import highchartsMore from "highcharts/highcharts-more.js"
import solidGauge from "highcharts/modules/solid-gauge.js";


const CollectionReport = () => {
    const history = useHistory();
    const services = new Service();
    highchartsMore(Highcharts);
    solidGauge(Highcharts);

    const [showRealData, setShowRealData] = useState();
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
     * Fetch customer intent report data 
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

    // /**
    //  * Collection Status chart config
    //  */
    // const collectionStatusOptions = {

    //     chart: {
    //         type: 'pie',
    //         height: (6 / 16 * 100) + '%'
    //     },
    //     title: {
    //         text: 'Collection',
    //         align: 'center',
    //         verticalAlign: 'middle',
    //         y: 15
    //     },
    //     credits: {
    //         enabled: false
    //     },
    //     plotOptions: {
    //         pie: {
    //             allowPointSelect: true,
    //             cursor: 'pointer',
    //             dataLabels: {
    //                 enabled: true,
    //                 format: '{point.percentage:.1f} %',
    //                 distance: -20,
    //             },
    //             showInLegend: true,
    //             size: '120%'
    //         }
    //     },
    //     legend: {
    //         align: 'right',
    //         verticalAlign: 'center',
    //         y: 50,
    //         layout: 'vertical'
    //     },
    //     series: [{
    //         name: 'Delivered amount',
    //         innerSize: '50%',
    //         data: customerIntentData
    //     }]
    // }


    // /**
    //  * Call Distribution chart config
    //  */
    // const callDistributionOptions = {

    //     chart: {
    //         type: 'pie',
    //         height: (9 / 19 * 100) + '%'
    //     },
    //     title: {
    //         text: '',
    //         align: 'center',
    //         verticalAlign: 'middle',
    //         y: 15
    //     },
    //     credits: {
    //         enabled: false
    //     },
    //     plotOptions: {
    //         pie: {
    //             allowPointSelect: true,
    //             cursor: 'pointer',
    //             dataLabels: {
    //                 enabled: true,
    //                 format: '{point.percentage:.1f} %',
    //                 distance: -20,
    //             },
    //             showInLegend: true,
    //             size: '120%'
    //         }
    //     },
    //     legend: {
    //         align: 'right',
    //         verticalAlign: 'center',
    //         y: 50,
    //         layout: 'vertical'
    //     },
    //     series: [{
    //         name: 'Delivered amount',
    //         data: callDistributionData
    //     }]
    // }



    /**
     * Collection Prediction Analysis chart config 
     */
    const collectionPredictionOption = {
        chart: {
            type: 'column',
            height: (3 / 5 * 100) + '%'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ['Settlement', 'Partial Settlement', 'Promise Broken', 'Denial']
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Prediction',
            data: [5, 3, 4, 8]
        }, {
            name: 'Actual',
            data: [2, 2, 3, 6]
        }]
    }

    // const customerIntentOptions = {

    //     chart: {
    //         type: 'pie',
    //         height: (6 / 16 * 100) + '%'
    //     },
    //     title: {
    //         text: 'Intent',
    //         align: 'center',
    //         verticalAlign: 'middle',
    //         y: 15
    //     },
    //     credits: {
    //         enabled: false
    //     },
    //     plotOptions: {
    //         pie: {
    //             allowPointSelect: true,
    //             cursor: 'pointer',
    //             dataLabels: {
    //                 enabled: true,
    //                 format: '{point.percentage:.1f} %',
    //                 distance: -20,
    //             },
    //             showInLegend: true,
    //             size: '120%'
    //         }
    //     },
    //     legend: {
    //         align: 'right',
    //         verticalAlign: 'center',
    //         y: 50,
    //         layout: 'vertical'
    //     },
    //     series: [{
    //         name: 'Delivered amount',
    //         innerSize: '50%',
    //         data: customerIntentData
    //     }]
    // }


    /**
     * Gauge chart option
     */
    const gaugeOption = {

        chart: {
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false
        },

        title: {
            text: ''
        },

        pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#FFF'],
                        [1, '#333']
                    ]
                },
                borderWidth: 0,
                outerRadius: '109%'
            }, {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#333'],
                        [1, '#FFF']
                    ]
                },
                borderWidth: 1,
                outerRadius: '107%'
            }, {
                // default background
            }, {
                backgroundColor: '#DDD',
                borderWidth: 0,
                outerRadius: '105%',
                innerRadius: '103%'
            }]
        },

        // the value axis
        yAxis: {
            min: 0,
            max: 100,
            // innerRadius: "250%",
            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',

            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 2,
                rotation: 'auto'
            },
            title: {
                text: '%'
            },
            plotBands: [{
                from: 0,
                to: 30,
                color: '#DF5353'
            }, {
                from: 30,
                to: 45,
                color: '#DDDF0D'
            }, {
                from: 45,
                to: 75,
                color: '#70EDA5'
            }, {
                from: 75,
                to: 100,
                color: '#55BF3B'
            }]
        },

        series: [{
            name: 'Speed',
            data: [65],
            tooltip: {
                valueSuffix: '%'
            }
        }],
        credits: {
            enabled: false
        }

    }


    /**
     * Change dummy data based on day selection
     */
    function chnageData() {
        // if (showRealData === false) {
        if (dateDifference === '7') {
            setCustomerIntentData([
                ['Denial', 15],
                ['Settlement', 9],
                ['Promise Broken', 9],
            ]);

            setCallDistributionData([
                ['Credit Card', 8],
                ['Platinum Card', 3],
                ['Auto Loan', 10],
                ['Housing Loan', 15]
            ]);

            setAggregatedCustomerIntentData([
                [400, 415, 430],
                [300, 390, 500],
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

            setCallDistributionData([
                ['Credit Card', 80],
                ['Platinum Card', 180],
                ['Auto Loan', 200],
                ['Housing Loan', 150]
            ]);

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

            setCallDistributionData([
                ['Credit Card', 8],
                ['Platinum Card', 3],
                ['Auto Loan', 10],
                ['Housing Loan', 15]
            ]);

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
    }, [dateDifference])

    useEffect(() => {
        if (showRealData == true)
            fetchData()
        else {
            console.log("???????????????????????????")
            chnageData()
            console.log(customerIntentData)
        }
    }, [showRealData])



    const changeReportInterval = (e) => {
        var day = e.target.id;
        setDateDifference(day)

    }


    /**
     * Outlier analysis bubble chart config
     */
    const outlierOption = {

        chart: {
            type: 'bubble',
            plotBorderWidth: 1,
            zoomType: 'xy'
        },

        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        xAxis: {
            gridLineWidth: 1,
            accessibility: {
                rangeDescription: 'Range: 0 to 100.'
            },
            gridLineColor: 'transparent'
        },

        yAxis: {
            startOnTick: false,
            endOnTick: false,
            accessibility: {
                rangeDescription: 'Range: 0 to 100.'
            },
            gridLineColor: 'transparent'
        },

        series: [{
            name: 'Settlement',
            data: [
                [85, 1, 20],
                [65, 2, 45],
                [45, 3, 30],
                [25, 4, 23]
            ],
            marker: {
                fillColor: {
                    radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                    stops: [
                        [0, 'rgba(255,235,255,0.5)'],
                        [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0.5).get('rgba')]
                    ]
                }
            }
        }, {
            name: 'Partial Settlement',
            data: [
                [75, 1, 90],
                [55, 2, 25],
                [35, 3, 60],
                [15, 4, 43]
            ],
            marker: {
                fillColor: {
                    radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                    stops: [
                        [0, 'rgba(255,5,255,0.5)'],
                        [1, Highcharts.color(Highcharts.getOptions().colors[1]).setOpacity(0.5).get('rgba')]
                    ]
                }
            }
        }, {
            name: 'Promise Broken',
            data: [
                [89, 1, 90],
                [69, 2, 25],
                [39, 3, 60],
                [29, 4, 43]
            ],
            marker: {
                fillColor: {
                    radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                    stops: [
                        [0, 'rgba(25,255,255,0.5)'],
                        [1, Highcharts.color(Highcharts.getOptions().colors[1]).setOpacity(0.5).get('rgba')]
                    ]
                }
            }
        }, {
            name: 'Denial',
            data: [
                [95, 1, 90],
                [75, 2, 25],
                [45, 3, 60],
                [25, 4, 43]
            ],
            marker: {
                fillColor: {
                    radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                    stops: [
                        [0, 'rgba(255,255,55,0.5)'],
                        [1, Highcharts.color(Highcharts.getOptions().colors[1]).setOpacity(0.5).get('rgba')]
                    ]
                }
            }
        }]

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
                                                    <div className="pannel-heading-icon">< BsFillCollectionFill /></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Collection </h3>
                                                        <p>Visualize your collection efficiency</p>

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
                                    <div className="col-lg-7 col-md-7" style={{}}>
                                        <div className="all-list" style={{ height: "625px" }}>
                                            <label>Collection Prediction Analysis</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={collectionPredictionOption}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-lg-5 col-md-5" style={{}}>
                                        <div className="row" style={{ paddingBottom: "5px" }}>

                                            <div className="col-md-6 col-md-6">
                                                <div className="all-list" style={{ height: "170px", textAlign: "center" }}>
                                                    <div style={{}}>
                                                        <FaRupeeSign size="70" />
                                                        <h4>9,12,53,000</h4>
                                                        <p>Collected</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-6 col-md-6">
                                                <div className="all-list" style={{ height: "170px", textAlign: "center" }}>
                                                    <div style={{}}>
                                                        <GiOnTarget size="70" />
                                                        <h4>88 %</h4>
                                                        <p>Prediction Accuracy</p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="row" style={{ paddingRight: "18px" }}>
                                            <div className="all-list" style={{ height: "450px" }}>
                                                <label>Success Point</label>
                                                <HighchartsReact
                                                    highcharts={Highcharts}
                                                    options={gaugeOption}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-12 col-md-12" style={{ paddingTop: "10px" }}>
                                        <div className="all-list" style={{ height: "425px" }}>
                                            <label>Outlier Analysis</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={outlierOption}
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

export default CollectionReport;