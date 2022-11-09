import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { AiFillPieChart } from 'react-icons/ai';
import React, { useEffect, useState } from 'react';
import Service from './../../webservice/http';
import { useHistory } from "react-router-dom";

const ServiceRequestAnalysis = (props) => {
    const history = useHistory();
    const services = new Service();

    const [showRealData, setShowRealData] = useState(true);

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
    function fetchData() {
        services.get(`api/dashboard/service_request_analysis/`).then(res => {
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
                    setServiceRequestDataSeries(res.service_request_report);
                    setDisplayDateCategory(res.date);
                    setServiceRequestDetail(res.count)
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

    useEffect(() => {
        if (showRealData === true) {
            fetchData()
        }
        else {
            createDummyData()
        }
    }, [showRealData])


    // const [displayDateCategory, setDisplayDateCategory] = useState(null);
    const [serviceRequestDataSeries, setServiceRequestDataSeries] = useState(null);

    const tempData = [
        [85, 48, 36, 96, 56, 52, 76, 96, 21, 87, 73, 21, 44, 60, 62, 25, 40, 98, 63, 73, 20, 21, 71, 60, 26, 38, 57, 23, 85, 30, 62, 96, 50, 89, 62, 94, 71, 69, 38, 21, 89, 62, 20, 20, 26, 40, 73, 71, 63, 79],
        [91, 74, 78, 45, 25, 56, 80, 65, 64, 81, 51, 39, 25, 48, 88, 34, 83, 29, 26, 63, 35, 78, 76, 26, 85, 21, 84, 39, 58, 67, 91, 59, 26, 21, 93, 48, 26, 35, 86, 83, 70, 26, 30, 46, 92, 20, 59, 82, 36, 55],
        [44, 70, 95, 37, 61, 23, 70, 50, 67, 85, 65, 42, 55, 79, 90, 59, 25, 32, 47, 21, 48, 92, 70, 76, 97, 97, 74, 92, 72, 36, 44, 37, 65, 25, 62, 59, 32, 83, 95, 70, 24, 94, 81, 45, 83, 72, 86, 35, 39, 92],
        [23, 92, 24, 61, 81, 43, 81, 39, 39, 98, 96, 79, 84, 97, 77, 28, 54, 96, 81, 87, 47, 86, 76, 60, 50, 40, 84, 41, 65, 81, 67, 70, 71, 61, 41, 84, 22, 58, 70, 28, 64, 23, 64, 75, 37, 84, 84, 74, 44, 43],
        [76, 67, 75, 45, 48, 91, 73, 23, 84, 89, 45, 38, 62, 50, 28, 57, 77, 57, 27, 97, 46, 57, 64, 42, 55, 69, 54, 27, 25, 94, 20, 37, 89, 70, 51, 49, 73, 63, 81, 22, 26, 45, 26, 85, 91, 66, 36, 57, 62, 97]
        [68, 86, 68, 32, 91, 68, 28, 37, 58, 77, 37, 77, 21, 67, 94, 42, 58, 83, 22, 53, 92, 90, 93, 97, 85, 42, 73, 84, 27, 24, 31, 90, 38, 46, 65, 60, 77, 52, 97, 80, 82, 94, 56, 77, 55, 45, 56, 95, 93, 38],
        [24, 27, 92, 25, 47, 82, 38, 62, 30, 39, 84, 61, 91, 89, 94, 37, 92, 29, 70, 26, 25, 29, 73, 80, 68, 65, 45, 49, 96, 95, 41, 28, 53, 58, 58, 41, 41, 77, 28, 41, 86, 54, 63, 29, 49, 60, 71, 82, 27, 98],
        [76, 97, 47, 82, 52, 47, 38, 50, 84, 93, 89, 53, 98, 85, 51, 48, 37, 66, 55, 54, 31, 93, 95, 60, 62, 38, 63, 58, 51, 92, 24, 69, 39, 86, 86, 28, 74, 94, 96, 55, 60, 51, 61, 85, 59, 74, 95, 67, 37, 32],
        [71, 82, 82, 69, 72, 45, 69, 24, 31, 71, 88, 70, 21, 82, 37, 44, 90, 69, 72, 97, 81, 54, 82, 31, 80, 44, 63, 35, 58, 60, 55, 82, 80, 40, 31, 87, 44, 82, 30, 76, 91, 31, 72, 59, 85, 29, 61, 84, 41, 61],
        [28, 76, 44, 55, 60, 31, 53, 66, 41, 41, 58, 44, 45, 35, 68, 38, 92, 77, 59, 71, 26, 58, 50, 98, 47, 65, 32, 72, 59, 66, 76, 60, 73, 69, 68, 70, 28, 47, 53, 51, 58, 56, 85, 39, 24, 75, 69, 31, 94, 82],
    ]

    const [serviceRequestDetail, setServiceRequestDetail] = useState([{ name: 'Open', y: 0 }, { name: 'Closed', y: 0 }, { name: 'Transferred', y: 0 }, { name: 'Disqualified', y: 0 }])

    function createDummyData() {
        try {
            console.log('======', props)
            var fData = props.filterData;
            var sDate = new Date(fData.start_date);
            var eDate = new Date(fData.end_date);
            var dateCategory = [];
            var dateDiff = eDate.getDate() - sDate.getDate();

            var serviceRequestSeries = []
            console.log(fData.products.length)
            var total = 0;
            for (let j = 0; j < fData.products.length; j++) {
                // var tempProduct = ;
                if (fData.products[j].status) {
                    var temOpportunityList = []
                    for (let i = 1; i <= dateDiff; i++) {
                        var total_agent = fData.repoters.length;
                        var deactivate_agent = 0
                        var deactivate_index = 0
                        for (let m = 0; m < total_agent; m++) {
                            if (fData.repoters[m].status === false) {
                                deactivate_agent = deactivate_agent + 1;
                                deactivate_index = m
                            }
                        }

                        var score = 0
                        if (deactivate_agent == total_agent) {
                            // temOpportunityList.push(0)
                            score = 0
                        }
                        else if (deactivate_agent == 0) {
                            // temOpportunityList.push(tempData[j][i])
                            score = tempData[j][i]
                        }
                        else {
                            // temOpportunityList.push(tempData[9 - j][50 - i - deactivate_index])
                            score = tempData[9 - j][50 - i - deactivate_index]
                        }

                        if (!fData.intent[0].status) {
                            try {
                                {
                                    if (i % 2 == 0) {
                                        score = score - (score * 0.8)
                                    }
                                    else {
                                        score = score - (score * 0.6)
                                    }
                                }
                            }
                            catch {

                            }
                        }

                        if (!fData.intent[1].status) {
                            try {
                                if (i % 2 == 0) {
                                    score = score - (score * 0.2)
                                }
                                else {
                                    score = score - (score * 0.4)

                                }
                            }
                            catch {

                            }
                        }

                        if (!fData.intent[0].status && !fData.intent[1].status) {
                            console.log('here----------------')
                            try {
                                score = 0
                            }
                            catch {

                            }
                        }

                        if (!fData.sentiment[0].status) {
                            try {
                                if (i % 2 == 0) {
                                    score = score - (score * 0.7)
                                }
                                else {
                                    score = score - (score * 0.9)

                                }
                            }
                            catch {

                            }
                        }

                        if (!fData.sentiment[1].status) {
                            try {
                                if (i % 2 == 0) {
                                    score = score - (score * 0.3)
                                }
                                else {
                                    score = score - (score * 0.1)

                                }
                            }
                            catch {

                            }
                        }

                        if (!fData.sentiment[0].status && !fData.sentiment[1].status) {
                            console.log('here----------------')
                            try {
                                score = 0
                            }
                            catch {

                            }
                        }

                        temOpportunityList.push(score)
                        total = total + score
                    }
                    serviceRequestSeries.push({
                        name: fData.products[j].product,
                        data: temOpportunityList
                    })
                }
            }

            setServiceRequestDetail([{ name: 'Open', y: total * 0.45 }, { name: 'Closed', y: total * 0.3 }, { name: 'Transferred', y: total * 0.2 }, { name: 'Disqualified', y: total * 0.05 }])
            // [total * 0.5, total * 0.1, total * 0.35, total * 0.05])

            for (let i = 1; i <= dateDiff; i++) {
                var tempDate = new Date(sDate.getTime() + (i * 60 * 60 * 24 * 1000))
                console.log(tempDate)
                dateCategory.push(tempDate.toISOString().substring(0, 10));
            }

            setServiceRequestDataSeries(serviceRequestSeries);
            setDisplayDateCategory(dateCategory);
        } catch (e) { console.log(e) }
    }


    useEffect(() => {
        if (showRealData == true) {
            fetchData()
        }
        else {
            createDummyData()
        }
    }, [props])

    const srTrendData = {
        chart: {
            type: 'column',
            height: (4 / 13 * 100) + '%'
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
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Service Request'
            },
            gridLineColor: 'transparent'
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: serviceRequestDataSeries,
        colors: ['#a3b5de', '#CDBE73', '#4e81db', '#1aadce', '#2c58ce', '#77a1e5', '#f28f43']
    }


    const serviceRequestSegOption = {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
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
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    connectorColor: 'silver'
                }
            }
        },
        series: [{
            name: 'Share',
            data: serviceRequestDetail
        }],
        colors: ['#a3b5de', '#CDBE73', '#4e81db', '#1aadce', '#2c58ce', '#77a1e5', '#f28f43']
    }

    return (
        <div className="row">
            <div className="col-md-8">
                <div style={{ paddingTop: "10px" }}>
                    <div className="assistant" style={{ height: "450px" }}>
                        <div style={{ paddingTop: "20px", paddingLeft: "40px" }}>
                            <label style={{ fontSize: "20px", color: "#271078" }}><AiFillPieChart /> &nbsp;Service Request Analysis</label>
                        </div>
                        <div style={{ height: "390px", overflow: "auto", overflowX: "hidden" }}>
                            <div className="accordion">

                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={srTrendData}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div style={{ paddingTop: "10px" }}>
                    <div className="assistant" style={{ height: "450px" }}>

                        <div style={{ overflow: "auto", overflowX: "hidden" }}>
                            <div className="accordion">

                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={serviceRequestSegOption}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default ServiceRequestAnalysis;