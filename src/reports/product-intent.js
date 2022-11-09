import Header from "../header/header";
import Footer from "../footer/footer";
import NavBar from "../nav/nav-bar";
import ReportNav from "./report-nav";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import wordCloud from "highcharts/modules/wordcloud.js";
import "./product-intent.css";
import { useState, useEffect } from "react";
import Service from './../webservice/http';
import { useHistory } from "react-router-dom";

const ProductIntentReport = () => {
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
                            if (item.status === true) {
                                setShowRealData(true);
                                fetchData();
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
     * Fetch product intent data
     */
    function fetchData() {


        var today = new Date();
        var endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - dateDifference);
        var startDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // console.log(start_date, end_date)

        services.get(`api/report/${startDate}/${endDate}/product_by_intent/`).then(res => {
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
                    var data = []
                    res.product_wise_report.map(item => {
                        if (item.PositiveSentiment > item.NegativeSentiment) {
                            var sentiment = 'Positive'
                        }
                        else {
                            var sentiment = 'Negative'
                        }
                        data.push(
                            {
                                'product': item.product__title,
                                'opportunity': item.Lead,
                                'serviceRequest': item.ServiceRequest,
                                'sentiment': sentiment,
                                'positive': item.PositiveIntent,
                                'negative': item.NegativeIntent,
                                'criticalKeyword': res.critical_keyword,
                                'consumablesInsight': res.consumables_insight
                            }
                        )
                    })
                    setProductIntentData(data);
                    // setCustomerIntentData([
                    //     ['Positive', data[0]['positive']],
                    //     ['Negative', data[0]['negative']],
                    // ])
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


    const [productIntentData, setProductIntentData] = useState([])

    const [customerIntentData, setCustomerIntentData] = useState(null)

    useEffect(() => {
        try {
            setCustomerIntentData([
                ['Positive', productIntentData[0]['positive']],
                ['Negative', productIntentData[0]['negative']],
            ]);
            setCriticalKeywors(productIntentData[0]['criticalKeyword']);
            setConsumablesInsight(productIntentData[0]['consumablesInsight']);
        }
        catch { }
    }, [productIntentData])


    /**
     * Customer Intent pie chart config 
     */
    const customerIntentOptions = {

        chart: {
            type: 'pie',
            height: (6 / 12 * 100) + '%'
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
                size: '100%'
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




    wordCloud(Highcharts);

    Highcharts.seriesTypes.wordcloud.prototype.deriveFontSize = function (
        relativeWeight
    ) {
        var maxFontSize = 25;
        // Will return a fontSize between 0px and 25px.
        return Math.floor(maxFontSize * relativeWeight);
    };

    const [criticalKeywords, setCriticalKeywors] = useState([]);
    const [consumablesInsight, setConsumablesInsight] = useState([]);
    const criticalKeywordsData = Highcharts.reduce(
        criticalKeywords,
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
     * Critical Keyword word cloud config
     */
    const criticalKeywordOptions = {
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

    const consumablesInsightData = Highcharts.reduce(
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
     * Consumables insight word cloud config
     */
    const consumablesInsightOptions = {
        title: {
            text: ''
        },
        credits: {
            enabled: false
        },
        series: [
            {
                type: "wordcloud",
                data: consumablesInsightData
            }
        ]
    };


    /**
     * Change Report data based on product selection
     * @param {*} positive Positive
     * @param {*} negative Negative
     * @param {*} consumablesInsight Consumables Insight
     * @param {*} criticalKeyword Critical Kayword
     */
    function changeData(positive, negative, consumablesInsight, criticalKeyword) {
        setCustomerIntentData(
            ['Positive', positive],
            ['Negative', negative]
        );
        console.log(consumablesInsight);
        console.log(criticalKeyword);
        setCriticalKeywors(criticalKeyword);
        setConsumablesInsight(consumablesInsight);
    }

    /**
     * change demo data based on changing day interval
     */
    function changeDemoData() {
        if (showRealData === false) {

            if (localStorage.getItem('critical_factor_module') === 'true') {
                if (dateDifference === '7') {
                    setProductIntentData([{
                        'product': 'Engine',
                        'opportunity': 41,
                        'serviceRequest': 35,
                        'sentiment': 'Positive',
                        'positive': 52,
                        'negative': 48,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Switch',
                        'opportunity': 58,
                        'serviceRequest': 40,
                        'sentiment': 'Negative',
                        'positive': 40,
                        'negative': 60,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Control',
                        'opportunity': 50,
                        'serviceRequest': 53,
                        'sentiment': 'Positive',
                        'positive': 65,
                        'negative': 35,
                        'criticalKeyword': [
                            'transfer loan', 'interest', 'high', 'transaction', 'offer'
                        ],
                        'consumablesInsight': [
                            'renew', 'banking'
                        ]
                    },
                    {
                        'product': 'Assembly',
                        'opportunity': 51,
                        'serviceRequest': 45,
                        'sentiment': 'Positive',
                        'positive': 55,
                        'negative': 45,
                        'criticalKeyword': [
                            'interest', 'high', 'transaction', 'expired', 'fine',
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue'
                        ]
                    }]);
                }

                if (dateDifference === '30') {
                    setProductIntentData([{
                        'product': 'Engine',
                        'opportunity': 247,
                        'serviceRequest': 231,
                        'sentiment': 'Positive',
                        'positive': 55,
                        'negative': 45,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Switch',
                        'opportunity': 209,
                        'serviceRequest': 210,
                        'sentiment': 'Positive',
                        'positive': 60,
                        'negative': 40,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Control',
                        'opportunity': 247,
                        'serviceRequest': 236,
                        'sentiment': 'Negative',
                        'positive': 35,
                        'negative': 65,
                        'criticalKeyword': [
                            'transfer loan', 'interest', 'high', 'transaction', 'offer'
                        ],
                        'consumablesInsight': [
                            'renew', 'banking'
                        ]
                    },
                    {
                        'product': 'Assembly',
                        'opportunity': 223,
                        'serviceRequest': 250,
                        'sentiment': 'Positive',
                        'positive': 58,
                        'negative': 42,
                        'criticalKeyword': [
                            'interest', 'high', 'transaction', 'expired', 'fine',
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue'
                        ]
                    }]);
                }

                if (dateDifference === '90') {
                    setProductIntentData([{
                        'product': 'Engine',
                        'opportunity': 702,
                        'serviceRequest': 645,
                        'sentiment': 'Positive',
                        'positive': 70,
                        'negative': 30,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Switch',
                        'opportunity': 662,
                        'serviceRequest': 606,
                        'sentiment': 'Positive',
                        'positive': 65,
                        'negative': 35,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Control',
                        'opportunity': 626,
                        'serviceRequest': 670,
                        'sentiment': 'Negative',
                        'positive': 35,
                        'negative': 65,
                        'criticalKeyword': [
                            'transfer loan', 'interest', 'high', 'transaction', 'offer'
                        ],
                        'consumablesInsight': [
                            'renew', 'banking'
                        ]
                    },
                    {
                        'product': 'Assembly',
                        'opportunity': 628,
                        'serviceRequest': 651,
                        'sentiment': 'Positive',
                        'positive': 58,
                        'negative': 42,
                        'criticalKeyword': [
                            'interest', 'high', 'transaction', 'expired', 'fine',
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue'
                        ]
                    }]);
                }
            }
            else {
                if (dateDifference === '7') {
                    setProductIntentData([{
                        'product': 'Credit Card',
                        'opportunity': 41,
                        'serviceRequest': 35,
                        'sentiment': 'Positive',
                        'positive': 52,
                        'negative': 48,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Saving Account',
                        'opportunity': 58,
                        'serviceRequest': 40,
                        'sentiment': 'Negative',
                        'positive': 40,
                        'negative': 60,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Insurance',
                        'opportunity': 50,
                        'serviceRequest': 53,
                        'sentiment': 'Positive',
                        'positive': 65,
                        'negative': 35,
                        'criticalKeyword': [
                            'transfer loan', 'interest', 'high', 'transaction', 'offer'
                        ],
                        'consumablesInsight': [
                            'renew', 'banking'
                        ]
                    },
                    {
                        'product': 'Travel Card',
                        'opportunity': 51,
                        'serviceRequest': 45,
                        'sentiment': 'Positive',
                        'positive': 55,
                        'negative': 45,
                        'criticalKeyword': [
                            'interest', 'high', 'transaction', 'expired', 'fine',
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue'
                        ]
                    }]);
                }

                if (dateDifference === '30') {
                    setProductIntentData([{
                        'product': 'Credit Card',
                        'opportunity': 247,
                        'serviceRequest': 231,
                        'sentiment': 'Positive',
                        'positive': 55,
                        'negative': 45,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Saving Account',
                        'opportunity': 209,
                        'serviceRequest': 210,
                        'sentiment': 'Positive',
                        'positive': 60,
                        'negative': 40,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Insurance',
                        'opportunity': 247,
                        'serviceRequest': 236,
                        'sentiment': 'Negative',
                        'positive': 35,
                        'negative': 65,
                        'criticalKeyword': [
                            'transfer loan', 'interest', 'high', 'transaction', 'offer'
                        ],
                        'consumablesInsight': [
                            'renew', 'banking'
                        ]
                    },
                    {
                        'product': 'Travel Card',
                        'opportunity': 223,
                        'serviceRequest': 250,
                        'sentiment': 'Positive',
                        'positive': 58,
                        'negative': 42,
                        'criticalKeyword': [
                            'interest', 'high', 'transaction', 'expired', 'fine',
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue'
                        ]
                    }]);
                }

                if (dateDifference === '90') {
                    setProductIntentData([{
                        'product': 'Credit Card',
                        'opportunity': 702,
                        'serviceRequest': 645,
                        'sentiment': 'Positive',
                        'positive': 70,
                        'negative': 30,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Saving Account',
                        'opportunity': 662,
                        'serviceRequest': 606,
                        'sentiment': 'Positive',
                        'positive': 65,
                        'negative': 35,
                        'criticalKeyword': [
                            'block', 'interest', 'high', 'credit limit', 'transaction', 'expired', 'cashback'
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue', 'new card'
                        ]
                    },
                    {
                        'product': 'Insurance',
                        'opportunity': 626,
                        'serviceRequest': 670,
                        'sentiment': 'Negative',
                        'positive': 35,
                        'negative': 65,
                        'criticalKeyword': [
                            'transfer loan', 'interest', 'high', 'transaction', 'offer'
                        ],
                        'consumablesInsight': [
                            'renew', 'banking'
                        ]
                    },
                    {
                        'product': 'Travel Card',
                        'opportunity': 628,
                        'serviceRequest': 651,
                        'sentiment': 'Positive',
                        'positive': 58,
                        'negative': 42,
                        'criticalKeyword': [
                            'interest', 'high', 'transaction', 'expired', 'fine',
                        ],
                        'consumablesInsight': [
                            'renew', 'reissue'
                        ]
                    }]);
                }
            }

            try {
                setCustomerIntentData([
                    ['Positive', productIntentData[0]['positive']],
                    ['Negative', productIntentData[0]['negative']],
                ]);
            } catch { }
        }
    }

    /**
     * change demo data based on changing day interval
     */
    const changeReportInterval = (e) => {
        var day = e.target.id;
        setDateDifference(day)
        changeDemoData()
    }

    useEffect(() => {
        if (showRealData == true)
            fetchData()
        else
            changeDemoData()
    }, [dateDifference])

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
                                                    <div className="pannel-heading-icon"><i className="flaticon-analytics"></i></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Product by Intent </h3>
                                                        <p>Analyses the intent of the product in detail</p>

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

                                    <div className="col-lg-8 col-md-8" style={{ paddingBottom: "10px", }}>
                                        <div className="all-list" style={{ minHeight: "305px" }}>

                                            <div>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                <p>
                                                                    Product
                                                                </p>
                                                            </th>
                                                            <th>
                                                                <p>Opportunities</p>
                                                            </th>
                                                            <th>
                                                                <p>Service Request</p>
                                                            </th>
                                                            <th>
                                                                <p>Total</p>
                                                            </th>
                                                            <th>
                                                                <p>Sentiment</p>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        {
                                                            productIntentData.map(
                                                                (item) => (
                                                                    <tr onClick={() => changeData(item.positive, item.negative, item.consumablesInsight, item.criticalKeyword)}>
                                                                        <td>{item.product}</td>
                                                                        <td>{item.opportunity}</td>
                                                                        <td>{item.serviceRequest}</td>
                                                                        <td>{item.opportunity + item.serviceRequest}</td>
                                                                        {
                                                                            item.sentiment === 'Positive' &&
                                                                            <td style={{ color: "green" }}>{item.sentiment}</td>
                                                                        }

                                                                        {
                                                                            item.sentiment === 'Negative' &&
                                                                            <td style={{ color: "red" }}>{item.sentiment}</td>
                                                                        }

                                                                    </tr>
                                                                )
                                                            )
                                                        }




                                                    </tbody>
                                                </table>
                                            </div>


                                        </div>
                                    </div>



                                    <div className="col-lg-4 col-md-4" style={{ paddingBottom: "10px", }}>
                                        <div className="all-list" style={{ minHeight: "305px" }}>
                                            <label>Customer Intent</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={customerIntentOptions}
                                            />
                                        </div>
                                    </div>


                                </div>


                                <div className="row">


                                    <div className="col-lg-6 col-md-6" style={{ paddingBottom: "5px", }}>
                                        <div className="all-list" style={{ minHeight: "350px" }}>
                                            <label>Critical Keyword</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={criticalKeywordOptions}
                                            />

                                        </div>
                                    </div>


                                    <div className="col-lg-6 col-md-6" style={{ paddingBottom: "5px", }}>
                                        <div className="all-list" style={{ minHeight: "350px" }}>
                                            <label>Consumables Insight</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={consumablesInsightOptions}
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

export default ProductIntentReport;