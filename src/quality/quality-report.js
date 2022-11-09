import { FaPhoneAlt } from 'react-icons/fa';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import Service from './../webservice/http';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { BsCheckLg, BsFillExclamationCircleFill, BsFillCheckCircleFill } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { useHistory } from "react-router-dom";
import { Collapse } from 'react-collapse';
import './quality-report.css';

const QualityReport = (props) => {
    const services = new Service();
    const history = useHistory();


    const [showRealData, setShowRealData] = useState(null);

    /**
     * Check wheathr to display dummy data or real data 
     * as per the configuration on backend
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
                        if (item.page === 'QA') {
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

    useEffect(() => {
        fetchDataConfig();
    }, [])


    /**
     * Initiate display data based on the fetched config
     */
    useEffect(() => {
        if (showRealData == true) {
            fetchData()
        }
        else if (showRealData == false) {
            fetchProduct();
            fetchCategoryData();
            fetchCheckpoint();
            setTotal(20);
        }
    }, [showRealData])


    const [report, setReport] = useState(null);

    /**
     * Fetch quality report data
     */
    function fetchData() {
        services.get(`api/call_quality/overall_report/`).then(res => {
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
                    setTotal(res.total);
                    setFailed(res.failed);


                    console.log('===================================>>>>>>>>>>>>>>>>>>>>>')
                    console.log(res)
                    setReport(res)
                    props.setReportData(res);
                    var product_seg = []
                    res.failed_calls.map(item => {
                        var new_item = true;
                        for (let i = 0; i < product_seg.length; i++) {
                            if (product_seg[i][0] == item.product) {
                                product_seg[i][1] = product_seg[i][1] + 1
                                new_item = false;
                                break;
                            }
                        }
                        if (new_item == true) {
                            product_seg.push([item.product, 1])
                        }
                    })
                    setProductList(product_seg)
                    var scriptC = []
                    res.failed_calls[0].script_report.map(item => {
                        console.log(item.phrase)
                        scriptC.push(item.phrase)
                    })
                    setScriptCategory(scriptC);

                    var ckps = []
                    res.failed_calls[0].checkpoint_report.map(item => {
                        ckps.push(item.checkpoint)
                    })
                    setProductCheckpointMap(ckps)
                    console.log('===================================>>>>>>>>>>>>>>>>>>>>>')
                    console.log(product_seg);
                }
                catch (e) {
                    // setError(e);
                }
            }
        })
    }


    const [productList, setProductList] = useState(null);
    const [productData, setProductData] = useState(null);

    const [total, setTotal] = useState(0)
    const [failed, setFailed] = useState(0)

    /**
     * Fetch the available products for logged users
     */
    function fetchProduct() {
        services.get(`/api/call_quality/available_products/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                var products = []
                var fail = 0
                for (let i = 0; i < res.length; i++) {
                    var tfail = Math.floor(Math.random() * 20);
                    products.push([res[i].title, tfail]);
                    fail = fail + tfail;
                }
                setProductList(products);
                setFailed(fail);
                setProductData(res);
            }
        })
    }

    const [scriptCategory, setScriptCategory] = useState('');

    /**
     * Fetch phrase category
     */
    function fetchCategoryData() {
        services.get(`/api/call_quality/phrase_category/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setScriptCategory(res);
            }
        })
    }

    const [productCheckpointMap, setProductCheckpointMap] = useState(null);

    /**
     * Fetch checkpoints
     */
    function fetchCheckpoint() {
        services.get(`/api/call_quality/product_checkpoint_map/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setProductCheckpointMap(res);
            }
        })
    }


    /**
     * Call distrivution pir chart configuration
     */
    const callDistributionOptions = {

        chart: {
            type: 'pie',
            height: (6 / 20 * 100) + '%'
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
            data:
                productList

        }]
    }

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    }

    const [showModal, setShowModal] = useState(false);
    const [showScript, setShowScript] = useState(false);
    const [showProduct, setShowProduct] = useState(false);


    /**
     * Toggle in tab 
     * @param {*} data Data
     */
    function displayData(data) {
        if (data == 'script') {
            setShowScript(true);
            setShowProduct(false);
        }
        else {
            setShowScript(false);
            setShowProduct(true);
        }
        setShowModal(true);
    }

    const [showVerificationFailedCalls, setShowVerificationFailedCalls] = useState(true);
    const [showCheckpointFailedCalls, setShowCheckpointFailedCalls] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('');


    /**
     * Toggle in call report details
     */
    function handleSelectedProduct(product) {
        setShowVerificationFailedCalls(false);
        setShowCheckpointFailedCalls(true);
        setSelectedProduct(product);
    }

    /**
     * Toggle in call report details
     */
    const handleSelectScriptReport = () => {
        setShowVerificationFailedCalls(true);
        setShowCheckpointFailedCalls(false);
    }

    return (
        <>
            <div className="call-table" style={{ width: "calc(100% - 444px)" }}>
                <div className="my-calls-column">
                    <div className="calls-top-pannel">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="pannel-heading clearfix">
                                    <div className="pannel-heading-info">
                                        <p>Quality Report </p>
                                        <h3>Report </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">

                    <div className="col-lg-4 col-md-4" style={{ paddingBottom: "5px", }}>
                        <div className="row" style={{ paddingLeft: "15px", paddingBottom: "10px" }}>
                            <div className="all-list" style={{ height: "100px" }}>
                                <label>Total Call</label>
                                <div className="pull-right" style={{ paddingRight: "15px" }}>
                                    <img src="/assets/images/col_info_col_icon_1.svg" />
                                </div>
                                <h2 style={{ color: "blue" }}>{total}</h2>
                            </div>
                        </div>
                        <div className="row" style={{ paddingLeft: "15px", paddingBottom: "10px" }}>
                            <div className="all-list" style={{ height: "100px" }}>
                                <label>Verification Passed</label>
                                <div className="pull-right" style={{ paddingRight: "15px" }}>
                                    <BsFillCheckCircleFill color="green" size="50" />
                                </div>
                                <h2 style={{ color: "green" }}>{total - failed}</h2>
                            </div>
                        </div>
                        <div className="row" style={{ paddingLeft: "15px", paddingBottom: "10px" }}>
                            <div className="all-list" style={{ height: "100px" }}>
                                <label>Verification Failed</label>
                                <div className="pull-right" style={{ paddingRight: "15px" }}>
                                    <BsFillExclamationCircleFill color="red" size="50" />
                                </div>
                                <h2 style={{ color: "red" }}>{failed}</h2>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8 col-md-8" style={{ paddingBottom: "5px", }}>
                        <div className="all-list" style={{ height: "320px" }}>
                            <label>Call Statistics</label>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={callDistributionOptions}
                            />

                        </div>
                    </div>
                </div>



                <div className="row" style={{ paddingLeft: "15px", paddingRight: "15px" }}>
                    <div className="all-list" style={{ minHeight: "450px" }}>


                        {
                            !showRealData &&
                            <>
                                <h4>Verification Failed</h4>
                                <div className="popup-footer">
                                    <button className="btn Save pull-left" type="button" onClick={() => displayData('script')}>Call Script</button>
                                </div>
                                <br />
                                <br />
                                <br />
                                <h4>Products</h4>

                                <div className="popup-footer">
                                    {
                                        productData &&
                                        productData.map(p => (
                                            <button className="btn Save pull-left" type="button" onClick={() => displayData(p.id)}>{p.title}</button>
                                        ))
                                    }
                                </div>
                            </>
                        }


                        {
                            showRealData &&
                            <>
                                <h4>Verification Failed</h4>
                                <div className="tab">
                                    <button className="tablinks" className={showCheckpointFailedCalls ? null : 'active'} onClick={handleSelectScriptReport}>Call Script</button>
                                    {/* {
                                        productList &&
                                        productList.map(item => (
                                            <button className="tablinks" className={showCheckpointFailedCalls ? selectedProduct === item[0] ? 'active' : null : null} onClick={() => handleSelectedProduct(item[0])}>{item[0]}</button>
                                        ))
                                    } */}
                                    {
                                        props.selectedProducts &&
                                        props.selectedProducts.map(item => (
                                            <button className="tablinks" className={showCheckpointFailedCalls ? selectedProduct === item['name'] ? 'active' : null : null} onClick={() => handleSelectedProduct(item['name'])}>{item['name']}</button>
                                        ))
                                    }
                                </div>

                                <div className="tabcontent">
                                    <Collapse isOpened={showVerificationFailedCalls}>
                                        <div className="">
                                            <table className="ss">
                                                <thead>
                                                    <tr>
                                                        <th>Agent</th>
                                                        <th>Customer</th>
                                                        {
                                                            scriptCategory &&
                                                            scriptCategory.map(item => (

                                                                <>
                                                                    {
                                                                        props.scripts.map(scriptItem => (
                                                                            <>
                                                                                {
                                                                                    scriptItem.item === item && scriptItem.status === true &&
                                                                                    <th>{item}</th>
                                                                                }
                                                                            </>
                                                                        ))
                                                                    }

                                                                </>
                                                            ))
                                                        }
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        report &&
                                                        report.failed_calls.map(reportItem => (
                                                            <tr onClick={() => history.push(`/call/${reportItem.id}/call-insight`)}>
                                                                <td>{reportItem.agent}</td>
                                                                <td>{reportItem.customer}</td>
                                                                {
                                                                    reportItem.script_report.map(scriptItem => (
                                                                        <>
                                                                            {
                                                                                props.scripts.map(propScriptItem => (
                                                                                    <>
                                                                                        {
                                                                                            propScriptItem.item === scriptItem.phrase && propScriptItem.status === true &&
                                                                                            <td>
                                                                                                {
                                                                                                    scriptItem.status == true ?
                                                                                                        <BsCheckLg size="22" color="green" /> :
                                                                                                        <FaTimes size="22" color="red" />
                                                                                                }
                                                                                            </td>
                                                                                        }
                                                                                    </>
                                                                                ))
                                                                            }
                                                                        </>

                                                                    ))
                                                                }
                                                            </tr>
                                                        ))
                                                    }


                                                </tbody>
                                            </table>
                                        </div>

                                    </Collapse>

                                    <Collapse isOpened={showCheckpointFailedCalls}>
                                        <div className="">
                                            <table className="ss">
                                                <thead>
                                                    <tr>
                                                        <th>Agent</th>
                                                        <th>Customer</th>
                                                        {
                                                            productCheckpointMap &&
                                                            productCheckpointMap.map(item => (
                                                                <>
                                                                    {
                                                                        props.checkpoints.map(checkpointItem => (
                                                                            <>
                                                                                {
                                                                                    checkpointItem.item === item && checkpointItem.status === true &&
                                                                                    <th>{item}</th>
                                                                                }
                                                                            </>
                                                                        ))
                                                                    }
                                                                </>
                                                            ))
                                                        }
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        report &&
                                                        report.failed_calls.map(reportItem => (
                                                            <>
                                                                {
                                                                    reportItem.product === selectedProduct &&

                                                                    <tr onClick={() => history.push(`/call/${reportItem.id}/call-insight`)}>
                                                                        <td>{reportItem.agent}</td>
                                                                        <td>{reportItem.customer}</td>
                                                                        {
                                                                            props.checkpoints.map(checkpointItem => (
                                                                                <>
                                                                                    {
                                                                                        reportItem.checkpoint_report.map(scriptItem => (
                                                                                            <>
                                                                                                {
                                                                                                    checkpointItem.item === scriptItem.checkpoint && checkpointItem.status === true &&
                                                                                                    <td>
                                                                                                        {
                                                                                                            scriptItem.status == true ?
                                                                                                                <BsCheckLg size="22" color="green" /> :
                                                                                                                <FaTimes size="22" color="red" />
                                                                                                        }
                                                                                                    </td>
                                                                                                }
                                                                                            </>
                                                                                        ))

                                                                                    }
                                                                                </>
                                                                            ))
                                                                        }

                                                                    </tr>
                                                                }
                                                            </>
                                                        ))
                                                    }


                                                </tbody>
                                            </table>
                                        </div>

                                    </Collapse>

                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>


            <Modal
                isOpen={showModal}
                style={customStyles}
            >
                <div className="">
                    <a className="pull-right" onClick={() => setShowModal(false)}>&#x2715; </a>

                    <div className="pannel-heading clearfix">
                        <div className="pannel-heading-info">
                            <br />
                            {
                                showScript &&
                                <h3>Script Failed Calls </h3>
                            }

                            {
                                showProduct &&
                                <h3>Product Report </h3>
                            }
                        </div>
                    </div>
                    {
                        showScript &&
                        <div className="call-table" style={{ overflowX: "inherit !important" }}>
                            <table className="ss">
                                <thead>
                                    <tr>
                                        <th>Agent</th>
                                        <th>Customer</th>
                                        {
                                            scriptCategory &&
                                            scriptCategory.map(item => (
                                                <th>{item.name}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Alok</td>
                                        <td>Anita</td>
                                        {
                                            scriptCategory &&
                                            scriptCategory.map(item => (
                                                <td>
                                                    <BsCheckLg size="22" color="green" />
                                                </td>
                                            ))
                                        }
                                    </tr>

                                    <tr>
                                        <td>Alok</td>
                                        <td>Anita</td>
                                        {
                                            scriptCategory &&
                                            scriptCategory.map(item => (
                                                <td>
                                                    <BsCheckLg size="22" color="green" />
                                                </td>
                                            ))
                                        }
                                    </tr>

                                    <tr>
                                        <td>Alok</td>
                                        <td>Anita</td>
                                        {
                                            scriptCategory &&
                                            scriptCategory.map(item => (
                                                <td>
                                                    <FaTimes size="22" color="red" />
                                                </td>
                                            ))
                                        }
                                    </tr>

                                    <tr>
                                        <td>Alok</td>
                                        <td>Anita</td>
                                        {
                                            scriptCategory &&
                                            scriptCategory.map(item => (
                                                <td>
                                                    <BsCheckLg size="22" color="green" />
                                                </td>
                                            ))
                                        }
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    }

                    {
                        showProduct &&
                        <div className="call-table" style={{ overflowX: "inherit !important" }}>
                            <table className="ss">
                                <thead>
                                    <tr>
                                        <th>Agent</th>
                                        <th>Customer</th>
                                        {
                                            productCheckpointMap &&
                                            productCheckpointMap.map(item => (
                                                <th>{item.checkpoint_name}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Alok</td>
                                        <td>Anita</td>
                                        {
                                            productCheckpointMap &&
                                            productCheckpointMap.map(item => (
                                                <td>
                                                    <BsCheckLg size="22" color="green" />
                                                </td>
                                            ))
                                        }
                                    </tr>

                                    <tr>
                                        <td>Alok</td>
                                        <td>Anita</td>
                                        {
                                            productCheckpointMap &&
                                            productCheckpointMap.map(item => (
                                                <td>
                                                    <BsCheckLg size="22" color="green" />
                                                </td>
                                            ))
                                        }
                                    </tr>

                                    <tr>
                                        <td>Alok</td>
                                        <td>Anita</td>
                                        {
                                            productCheckpointMap &&
                                            productCheckpointMap.map(item => (
                                                <td>
                                                    <FaTimes size="22" color="red" />
                                                </td>
                                            ))
                                        }
                                    </tr>

                                    <tr>
                                        <td>Alok</td>
                                        <td>Anita</td>
                                        {
                                            productCheckpointMap &&
                                            productCheckpointMap.map(item => (
                                                <td>
                                                    <BsCheckLg size="22" color="green" />
                                                </td>
                                            ))
                                        }
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </Modal>

        </>
    );
}

export default QualityReport;