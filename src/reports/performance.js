import Header from "../header/header";
import Footer from "../footer/footer";
import NavBar from "../nav/nav-bar";
import ReportNav from "./report-nav";
import { VscActivateBreakpoints } from "react-icons/vsc";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useState } from "react";
// import drilldown from 'highcharts/modules/drilldown.js';
// import HCSoldGauge from 'highcharts/modules/solid-gauge';
import highchartsMore from "highcharts/highcharts-more.js"
import solidGauge from "highcharts/modules/solid-gauge.js";
const Performance = () => {

    highchartsMore(Highcharts);
    solidGauge(Highcharts);

    // HCSoldGauge(Highcharts);
    const [showAgentView, setShowAgentView] = useState(true);
    const [showManagerView, setShowManagerView] = useState(false);
    const [showCompanyView, setShowCompanyView] = useState(false);


    /**
     * Company performance chart options
     */
    const CompanyPerformanceOption = {
        chart: {
            type: 'column'
        },
        title: {
            text: "Manager's Performance"
        },
        xAxis: {
            categories: [
                'Bishal',
                'Alok',
                'Amar',
                'Vivek',
                'Sachin',
                'Aman'
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Values (in M)'
            },
            gridLineColor: 'transparent'
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0">₹<b>{point.y:.1f} K</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                events: {
                    click: function () {
                        setShowManagerView(true);
                        setShowCompanyView(false);
                        setShowAgentView(false);
                    }
                }
            }
        },
        series: [{
            name: 'Target',
            data: [80, 80, 50, 40, 40, 40]

        }, {
            name: 'Achieved',
            data: [64, 77, 39, 40, 30, 39]

        }],
        colors: ['#1aadce', '#2c58ce', '#77a1e5', '#a3b5de', '#CDBE73', '#4e81db', '#f28f43']
    }

    /**
     * Manager Performance chart options
     */
    const ManagerPerformanceOption = {
        chart: {
            type: 'column'
        },
        title: {
            text: "Agents's Performance"
        },
        xAxis: {
            categories: [
                'Rohit',
                'Vinay',
                'Arjun',
                'Vijay',
                'Sumit',
                'Karan'
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Values (in M)'
            },
            gridLineColor: 'transparent'
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0">₹<b>{point.y:.1f} K</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            },
            series: {
                events: {
                    click: function () {
                        setShowManagerView(false);
                        setShowCompanyView(false);
                        setShowAgentView(true);
                    }
                }
            }
        },
        series: [{
            name: 'Target',
            data: [10, 15, 20, 10, 10, 10]

        }, {
            name: 'Achieved',
            data: [8, 12, 10, 10, 10, 9]

        }],
        colors: ['#4e81db', '#f28f43', '#1aadce', '#2c58ce', '#77a1e5', '#a3b5de', '#CDBE73']
    }


    /**
     * Agent performance chart options
     */
    const AgentPerformance = {

        chart: {
            type: 'solidgauge',
            height: '40%'
        },

        title: {
            text: 'Self Performance',
            style: {
                fontSize: '24px'
            }
        },
        subtitle: {
            text: '<a style="color:#f28f43">Target : ₹10K</a>  <a style="color:#1aadce">Achieved : ₹8K</a>',
            verticalAlign: 'bottom',
            style: {
                fontSize: '26px',
                fontWeight: "bold"
            },
        },

        tooltip: {
            borderWidth: 0,
            backgroundColor: 'none',
            shadow: false,
            style: {
                fontSize: '16px'
            },
            valueSuffix: '%',
            pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}</span>',
            positioner: function (labelWidth) {
                return {
                    x: (this.chart.chartWidth - labelWidth) / 2,
                    y: (this.chart.plotHeight / 2) + 15
                };
            }
        },

        pane: {
            startAngle: 0,
            endAngle: 360,
            background: [{ // Track for Move
                outerRadius: '112%',
                innerRadius: '88%',
                backgroundColor: Highcharts.color('#f28f43')
                    .setOpacity(0.3)
                    .get(),
                borderWidth: 0
            }]
        },

        yAxis: {
            min: 0,
            max: 100,
            lineWidth: 0,
            tickPositions: []
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    enabled: false
                },
                linecap: 'round',
                stickyTracking: false,
                rounded: true
            }
        },

        series: [{
            name: 'Achieved',
            data: [{
                color: '#1aadce',
                radius: '112%',
                innerRadius: '88%',
                y: 80
            }]
        }],
        colors: ['#4e81db', '#f28f43', '#1aadce', '#2c58ce', '#77a1e5', '#a3b5de', '#CDBE73']
    }


    const showAgentViewReport = () => {
        setShowManagerView(false);
        setShowCompanyView(false);
        setShowAgentView(true);
    }

    const showManagerViewReport = () => {
        setShowManagerView(true);
        setShowCompanyView(false);
        setShowAgentView(false);
    }

    const showCompanyViewReport = () => {
        setShowManagerView(false);
        setShowCompanyView(true);
        setShowAgentView(false);
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
                                                    <div className="pannel-heading-icon">< VscActivateBreakpoints /></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Performance </h3>
                                                        <p>Performance Analysis</p>

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="pannel-nav clearfix">
                                                    <ul className="clearfix">
                                                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                                            <label className="btn btn-default active" id="7" onClick={showAgentViewReport} >
                                                                <input type="radio" name="options" autoComplete="off" /> Agent</label>
                                                            <label className="btn btn-default" id="30" onClick={showManagerViewReport}>
                                                                <input type="radio" name="options" autoComplete="off" /> Manager </label>
                                                            <label className="btn btn-default" id="90" onClick={showCompanyViewReport}>
                                                                <input type="radio" name="options" autoComplete="off" /> Company</label>
                                                        </div>
                                                    </ul>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        {
                                            showCompanyView &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={CompanyPerformanceOption}
                                            />
                                        }

                                        {
                                            showManagerView &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={ManagerPerformanceOption}
                                            />
                                        }

                                        {
                                            showAgentView &&
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={AgentPerformance}
                                            />
                                        }
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </div>

    );
}

export default Performance;