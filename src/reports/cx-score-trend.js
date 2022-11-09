import Header from "../header/header";
import Footer from "../footer/footer";
import NavBar from "../nav/nav-bar";
import ReportNav from "./report-nav";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useEffect, useState } from "react";
import Service from './../webservice/http';
import { useHistory } from "react-router-dom";

const CXScoreTrendReport = () => {
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
     * Fetch cx trend report data
     */
    function fetchData() {


        var today = new Date();
        var endDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        today.setDate(today.getDate() - dateDifference);
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
                    var trend = []
                    var data = []
                    var dates = []
                    console.log("--")
                    var resData = res
                    resData.map(item => {
                        console.log(",,,,,,,,,,,,,,,,,")
                        console.log(item)
                        trend.push([item.call_date, item.AverageCX])
                        data.push([item.call_date, item.CallCount, item.MaxCX, item.MinCX])
                        dates.push(item.call_date)
                    })
                    setCXScoreData(trend);
                    setCXScoreTableData(data);
                    console.log(cxScoreData)
                    console.log(cxScoreTableData)
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
    const [cxScoreData, setCXScoreData] = useState();
    const [cxScoreTableData, setCXScoreTableData] = useState();

    /**
     * change demo data based on changing day interval
     */
    function changeDemoData() {
        var newDate = new Date();
        var tempData = [];
        var tempTableData = [];
        for (let i = day; i > 0; i--) {
            newDate = new Date();
            newDate.setDate(newDate.getDate() - i);
            console.log(newDate);
            tempData.push(
                [newDate, Math.floor(Math.random() * (65 - 35) + 35)]
            )
            tempTableData.push([
                newDate.toDateString(),
                Math.floor(Math.random() * (200 - 35) + 35),
                Math.floor(Math.random() * (80 - 60) + 60),
                Math.floor(Math.random() * (40 - 10) + 10)
            ]);
        }
        console.log(tempData);
        console.log(tempTableData);
        setCXScoreData(tempData);
        setCXScoreTableData(tempTableData);
    }


    /**
     * CX Score trend chart option
     */
    const cxTrendOptions = {
        chart: {
            type: 'scatter',
            height: (6 / 40 * 100) + '%'
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

    useEffect(() => {
        if (showRealData == true) {
            fetchData()
        }
        else {
            changeDemoData();
        }
    }, [day])
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
                                                    <div className="pannel-heading-icon"><i className="fa fa-line-chart" aria-hidden="true"></i></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>CX Score Trend </h3>
                                                        <p>Track the CX Score by date, and the impact of CX Score over time</p>

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

                                    <div className="col-lg-12 col-md-12" style={{ paddingBottom: "5px", }}>
                                        <div className="all-list" style={{ maxHeight: "300px" }}>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={cxTrendOptions}
                                            />
                                        </div>
                                    </div>
                                </div>



                                <div className="row">
                                    <div className="col-lg-12 col-md-12" style={{ paddingBottom: "25px", }}>
                                        <div className="all-list">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <p>
                                                                Date
                                                                </p>
                                                        </th>
                                                        <th>
                                                            <p># of Calls</p>
                                                        </th>
                                                        <th>
                                                            <p>High Score</p>
                                                        </th>
                                                        <th>
                                                            <p>Low Score</p>
                                                        </th>
                                                        <th>
                                                            <p>Avergae</p>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {
                                                        cxScoreTableData &&
                                                        cxScoreTableData.map(
                                                            (item) => (
                                                                <tr>
                                                                    <td>{item[0]}</td>
                                                                    <td>{item[1]}</td>
                                                                    <td>{item[2]}%</td>
                                                                    <td>{item[3]}%</td>
                                                                    <td>{(item[2] + item[3]) / 2}%</td>
                                                                </tr>

                                                            )
                                                        )
                                                    }




                                                </tbody>
                                            </table>

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

export default CXScoreTrendReport;