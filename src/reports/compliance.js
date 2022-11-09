import Header from "../header/header";
import Footer from "../footer/footer";
import NavBar from "../nav/nav-bar";
import ReportNav from "./report-nav";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


const ComplianceReport = () => {

    /**
     * Missing trade confirmation pie chart config 
     */
    const tradeFailureReportOption = {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0
            }
        },
        title: {
            text: ''
        },
        accessibility: {
            point: {
                valueSuffix: '%'
            }
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Confirmation',
            data: [
                ['Asked', 90],
                ['Price Confirmation Missed', 15],
                ['Total Price Confirmation Missed', 25],
                ['Quantity Confirmation Missed', 12]
            ]
        }],
        credits: {
            enabled: false
        },
        colors: ['#f28f43', '#1aadce', '#2c58ce', '#77a1e5', '#a3b5de', '#CDBE73']
    }


    /**
     * Delivery refusal bar chart options
     */
    const deliveryRefusalReportOption = {
        chart: {
            type: 'column'
        },
        title: {
            text: ''
        },
        colors: ['#f28f43', '#1aadce', '#2c58ce', '#77a1e5', '#a3b5de', '#CDBE73'],
        xAxis: {
            crosshair: true,
            labels: {
                style: {
                    fontSize: '14px'
                }
            },
            type: 'category'
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Price Mismatch'
            },
            gridLineColor: 'transparent'
        },
        tooltip: {
            valueSuffix: ' '
        },
        series: [{
            name: 'Mismatch',
            colorByPoint: true,
            data: [
                ['Refusal', 322],
                ['Accepted', 689]
            ],
            showInLegend: false
        }],
        credits: {
            enabled: false
        }
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
                                                    <div className="pannel-heading-icon"></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Compliance and Surveillance Report </h3>
                                                        <p>Visualize your Compliances</p>

                                                    </div>
                                                </div>
                                            </div>



                                            <div className="col-lg-6">
                                                <div className="pannel-nav clearfix">
                                                    <ul className="clearfix">
                                                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                                                            <label className="btn btn-default active" id="7">
                                                                <input type="radio" name="options" autoComplete="off" /> 7 Days</label>
                                                            <label className="btn btn-default" id="30">
                                                                <input type="radio" name="options" autoComplete="off" /> 30 Days </label>
                                                            <label className="btn btn-default" id="90" >
                                                                <input type="radio" name="options" autoComplete="off" /> 90 Days</label>
                                                        </div>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>


                                <div className="row">

                                    <div className="col-md-6">
                                        <div className="all-list" style={{ height: "475px" }}>
                                            <label>Missed Trade Confirmation</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={tradeFailureReportOption}
                                            />
                                        </div>
                                    </div>


                                    <div className="col-md-6">
                                        <div className="all-list" style={{ height: "475px" }}>
                                            <label>Delivery Refusal for Price Mismatch</label>
                                            <HighchartsReact
                                                highcharts={Highcharts}
                                                options={deliveryRefusalReportOption}
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
        </div>
    );
}

export default ComplianceReport;