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


const ManagerReviewReport = () => {
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
     * Fetch manager review report data
     */
    function fetchData() {
        var today = new Date();
        var endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - dateDifference);
        var startDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        // console.log(start_date, end_date)

        services.get(`api/report/${startDate}/${endDate}/manager_review/`).then(res => {
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
                    res.review_report.map(item => {
                        data.push([
                            item.call__call_reference,
                            item.call__call_date,
                            item.CommentCount,
                            item.ReadComment,
                            item.call__cx_score
                        ])
                    })
                    setCallCommentData(data);
                    setPositiveKeywords(res.positive_keyword)
                    setNegativeKeywords(res.negative_keyword)
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
    const [callCommentData, setCallCommentData] = useState();
    const [positiveKeywords, setPositiveKeywords] = useState([]);
    const [negativeKeywords, setNegativeKeywords] = useState([]);

    Date.prototype.toShortFormat = function () {

        let monthNames = ["Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec"];

        let day = this.getDate();

        let monthIndex = this.getMonth();
        let monthName = monthNames[monthIndex];

        let year = this.getFullYear();

        return `${day}-${monthName}-${year}`;
    }

    /**
     * change demo data based on changing day interval
     */
    function changeDemoData() {
        var total = 0;
        if (day === 7) {
            total = 246
        }
        if (day === 30) {
            total = 1152
        }
        if (day === 90) {
            total = 3500
        }
        var tempData = [];
        var newDate = new Date();
        for (let i = 0; i < total; i++) {
            let comm = Math.floor(Math.random() * (5 - 0) + 0);
            newDate = new Date();
            newDate.setDate(newDate.getDate() - (Math.floor(Math.random() * (day - 1) + 1)))
            tempData.push([
                'DKOP' + Math.floor(Math.random() * (99999 - 11111) + 11111),
                newDate.toShortFormat(),
                comm,
                Math.floor(Math.random() * (comm - 0) + 0),
                Math.floor(Math.random() * (75 - 10) + 10),
            ])
        }
        console.log(tempData)
        setCallCommentData(tempData);
        setPositiveKeywords(['like', 'thank', 'you', 'wonderful', 'great', 'product', 'go for', 'nice', 'satisfied'])
        setNegativeKeywords(['worst', 'bad service', 'product', 'ever', 'unfortunately'])
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
            setDateDifference(30);
            setDay(30);
        }

        if (day === '90') {
            setDateDifference(90);
            setDay(90);
        }
    }


    wordCloud(Highcharts);

    Highcharts.seriesTypes.wordcloud.prototype.deriveFontSize = function (
        relativeWeight
    ) {
        var maxFontSize = 25;
        // Will return a fontSize between 0px and 25px.
        return Math.floor(maxFontSize * relativeWeight);
    };

    const positiveKeywordsData = Highcharts.reduce(
        positiveKeywords,
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
     * Positive keyword word cloud option
     */
    const positiveKeywordOptions = {
        chart: {
            height: (6 / 16 * 100) + '%'
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
                data: positiveKeywordsData
            }
        ]
    };


    const negativeKeywordsData = Highcharts.reduce(
        negativeKeywords,
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
     * Negative keyword word cloud option
     */
    const negativeKeywordOptions = {
        chart: {
            height: (6 / 16 * 100) + '%'
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
                data: negativeKeywordsData
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
                                                    <div className="pannel-heading-icon"><i className="fa fa-comment" aria-hidden="true"></i></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Manager Review </h3>
                                                        <p>Manager reviews the conversations by Agent, add comments to improve CX</p>

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

                                    <div className="col-lg-8 col-md-8" style={{ paddingBottom: "5px", }}>
                                        <div className="all-list">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <p>
                                                                Call Ref #
                                                            </p>
                                                        </th>
                                                        <th>
                                                            <p>Date</p>
                                                        </th>
                                                        <th>
                                                            <p>Comments</p>
                                                        </th>
                                                        <th>
                                                            <p>Read</p>
                                                        </th>
                                                        <th>
                                                            <p>Unread</p>
                                                        </th>
                                                        <th>
                                                            <p>CX Score</p>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {
                                                        callCommentData &&
                                                        callCommentData.map((item) => (
                                                            <tr>
                                                                <td>{item[0]}</td>
                                                                <td>{item[1]}</td>
                                                                <td>{item[2]}</td>
                                                                <td>{item[3]}</td>
                                                                <td>{item[2] - item[3]}</td>
                                                                <td>{item[4]}%</td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="col-lg-4 col-md-4" style={{ paddingBottom: "5px", }}>
                                        <div className="row">

                                            <div className="col-lg-12 col-md-12" style={{ paddingBottom: "5px", }}>
                                                <div className="all-list" style={{ maxHeight: "300px" }}>
                                                    <label>Positive Keyword</label>
                                                    <HighchartsReact
                                                        highcharts={Highcharts}
                                                        options={positiveKeywordOptions}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">

                                            <div className="col-lg-12 col-md-12" style={{ paddingBottom: "5px", }}>
                                                <div className="all-list" style={{ maxHeight: "300px" }}>
                                                    <label>Negative Keyword</label>
                                                    <HighchartsReact
                                                        highcharts={Highcharts}
                                                        options={negativeKeywordOptions}
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
            <Footer />
        </div >
    );
}

export default ManagerReviewReport;