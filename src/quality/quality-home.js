import Header from './../header/header';
import Footer from './../footer/footer';
import NavBar from './../nav/nav-bar';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Link } from "react-router-dom";
import { SiPurescript } from 'react-icons/si';
import { GiPointySword } from 'react-icons/gi';
import { HiDocumentReport } from 'react-icons/hi';
import ScriptSetup from './script';
import CheckPoint from './checkpoint';
import QualityReport from './quality-report';
import { useEffect, useState } from 'react';
// import styles from './quality.module.css';
import Multiselect from 'multiselect-react-dropdown';


const QualityHome = () => {
    const [tab, setTab] = useState('report');
    const [reportData, setReportData] = useState(null);
    const [products, setProducts] = useState([]);
    const [checkpoints, setCheckPoints] = useState([]);
    const [scripts, setScripts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    /**
     * Populate quality report data in frontend
     */
    useEffect(() => {
        if (reportData != null) {
            try {
                var product_seg = []
                reportData.failed_calls.map(item => {
                    var new_item = true;
                    for (let i = 0; i < product_seg.length; i++) {
                        if (product_seg[i].name === item.product) {
                            new_item = false;
                            break;
                        }
                    }
                    if (new_item == true) {
                        product_seg.push({ name: item.product })
                    }
                })
                console.log(product_seg)
                setProducts(product_seg)
                setSelectedProducts(product_seg)

                var checkpointDumb = reportData.failed_calls[0].checkpoint_report
                if (checkpoints.length == 0) {
                    checkpointDumb.map(item => {
                        setCheckPoints(oldItems => [...oldItems, { item: item.checkpoint, status: true }])
                    })
                }
                console.log(checkpoints)

                var scriptDumb = reportData.failed_calls[0].script_report
                if (scripts.length == 0) {
                    scriptDumb.map(item => {
                        setScripts(oldItems => [...oldItems, { item: item.phrase, status: true }])
                    })
                }
            }
            catch { }
        }
    }, [reportData]);


    /**
     * Filter selected checkpointsS
     * @param {*} checkpoint Checkpoint
     */
    function changeCheckPointSelection(checkpoint) {
        var staticCheckpoint = [...checkpoints];
        for (let i = 0; i < checkpoints.length; i++) {
            if (checkpoints[i].item == checkpoint) {
                staticCheckpoint[i].status = !staticCheckpoint[i].status;
                break;
            }
        }
        setCheckPoints(oldItems => staticCheckpoint);
        console.log(checkpoints)
    }


    /**
     * Apply FIlter on Script Category
     * @param {*} script Script
     */
    function changeScriptSelection(script) {
        var staticScripts = [...scripts];
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].item == script) {
                staticScripts[i].status = !staticScripts[i].status;
                break;
            }
        }
        setScripts(oldItems => staticScripts);
        console.log(scripts)
    }

    /**
     * Remove product from filter selection
     * @param {*} selectedList Selected List
     * @param {*} removedItem Item to be removed
     */
    const removeProduct = (selectedList, removedItem) => {
        setSelectedProducts(selectedList)
    }


    /**
     * Add product to filter selection
     * @param {*} selectedList Selected List
     * @param {*} selectedItem Item that is selected
     */
    const selectProduct = (selectedList, selectedItem) => {
        setSelectedProducts(selectedList)
    }


    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <NotificationContainer />
            <div>
                <div className="container-fluid">
                    <div className="my-call">

                        <div className="side-panel-with-table clearfix">
                            <div className="side-panel" style={{ width: "444px" }}>

                                <nav className="secondary-menu">
                                    <ul>
                                        <li className={tab == 'report' ? "active" : ""} onClick={() => setTab('report')}><Link to='#'><HiDocumentReport size="20px" /><a>Quality Audit Report</a></Link></li>
                                        <li className={tab == 'script' ? "active" : ""} onClick={() => setTab('script')}><Link to='#'><SiPurescript size="20px" /><a>Primary Consumable Insights</a></Link></li>
                                        <li className={tab == 'checkpoint' ? "active" : ""} onClick={() => setTab('checkpoint')}><Link to='#'><GiPointySword size="20px" /><a>Secondary Consumable Insights</a></Link></li>
                                    </ul>
                                </nav>

                                {
                                    tab === 'report' &&
                                    <div className="my-call">
                                        <div className="my-calls-column">
                                            <div className="calls-top-pannel">
                                                <div className="my-calls-form">
                                                    <div className="form-col clearfix">
                                                        <label>Filter Products</label>
                                                        <Multiselect
                                                            options={products}
                                                            displayValue="name"
                                                            onSelect={selectProduct}
                                                            onRemove={removeProduct}
                                                            selectedValues={selectedProducts}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <hr />

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-col clearfix">
                                                        <p className="blue">Checkpoints</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {
                                                checkpoints &&
                                                checkpoints.map(item => (

                                                    <div className="row">
                                                        <div className="col-md-9">
                                                            <div className="select-check">
                                                                <label className="checkbox-container">
                                                                    {item.item}
                                                                    <input type="checkbox" defaultChecked={item.status} onChange={() => changeCheckPointSelection(item.item)} />
                                                                    <span className="checkmark"></span>
                                                                    <br />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                ))
                                            }

                                            <hr />


                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-col clearfix">
                                                        <p className="blue">Scripts</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {
                                                scripts &&
                                                scripts.map(item => (

                                                    <div className="row">
                                                        <div className="col-md-9">
                                                            <div className="select-check">
                                                                <label className="checkbox-container">
                                                                    {item.item}
                                                                    <input type="checkbox" defaultChecked={item.status} onChange={() => changeScriptSelection(item.item)} />
                                                                    <span className="checkmark"></span>
                                                                    <br />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                ))
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                            {
                                tab === 'report' &&
                                <QualityReport setReportData={setReportData} reportData={reportData} scripts={scripts} checkpoints={checkpoints} selectedProducts={selectedProducts} />
                            }
                            {
                                tab === 'script' &&
                                <ScriptSetup />
                            }
                            {
                                tab === 'checkpoint' &&
                                <CheckPoint />
                            }
                        </div>

                    </div>
                </div>
            </div>


            <Footer />
        </div>
    );
}

export default QualityHome;