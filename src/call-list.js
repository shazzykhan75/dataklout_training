import Header from './header/header';
import Footer from './footer/footer';
import NavBar from './nav/nav-bar';
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import WebPull from './webservice/web-pull';
import { Link } from "react-router-dom";
import Service from './webservice/http';
import ProgressBar from './progress-bar';
import fetchProgress from 'fetch-progress';
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import PulseLoader from "react-spinners/PulseLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Filter from './filter';
import { FaFilter } from "react-icons/fa";

const CallList = () => {
    const history = useHistory();

    //const { data: callList, error, isPending } = WebPull('https://fb.dataklout.com/api/call/call_list/')

    const [callList, setCallList] = useState(null);
    const [error, setError] = useState(null);
    const [isPending, setisPending] = useState(true);


    /**
     * Fetch Call List data 
     */
    async function fetchCallList() {
        setError(null);
        services.get('api/call/call_list/').then(res => {
            setisPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setCallList(res);
                    setError(null);
                }
                catch (e) {
                    setError(e);
                }
            }
        })
    }

    useEffect(() => {
        fetchCallList();
        fetchSupportingInfo();
    }, [history]);


    /**
     * Handle refresh call list in each specific interval
     * 
     * This is required to display audio processing progress
     */
    useEffect(() => {
        const interval = setInterval(() => {
            fetchCallList();
        }, refreshTime);

        return () => clearInterval(interval);
    }, [])

    const [refreshTime, setRefreshTime] = useState(10000);
    //setInterval(fetchCallList, refreshTime);

    const [showCallModal, setShowCallModal] = useState(false);
    const toggolCallModal = () => {
        setShowCallModal(!showCallModal);
    }

    const [supportingInfo, setSupportingInfo] = useState();
    const [supportingInfoPending, setSupportingInfoPending] = useState();
    const [supportingInfoError, setSupportingInfoError] = useState();

    const services = new Service();


    const [uploadFile, setUploadFile] = useState(null);
    const [callType, setCallType] = useState('');
    const [product, setProduct] = useState('');
    const [languageCode, setLanguageCode] = useState('');
    const [customerID, setCustomerID] = useState('');

    //const [uploadData, setUploadData] = useState(null);
    const [uploadPending, setUploadPending] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [callUploadProgress, setCallUploadProgress] = useState(0);


    /**
     * Upload call recording file with other required details to process
     * 
     * axios is being used here to display upload progress
     */
    const uploadCallRecording = () => {
        setCallUploadProgress(0);
        setUploadError(null)
        setSupportingInfoError('');

        if (callType === '') {
            setSupportingInfoError('Please Select Call Type')
            return;
        }

        if (product === '') {
            setSupportingInfoError('Please Select one product')
            return;
        }

        if (languageCode === '') {
            setSupportingInfoError('Please Select one language')
            return;
        }

        if (customerID === '') {
            setSupportingInfoError('Please Select one customer')
            return;
        }

        if (uploadFile === null) {
            setSupportingInfoError('Please select one audio recording file');
            return;
        }

        setUploadPending(true);
        var url = services.domain + '/api/call/new_call/';

        let formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('call_type', callType);
        formData.append('product', product);
        formData.append('language_code', languageCode);
        formData.append('customer_id', customerID);
        console.log('File size :' + uploadFile.size);

        axios.request({
            method: "post",
            url: url,
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token'), },
            data: formData,
            onUploadProgress: (p) => {
                console.log(p.loaded);
                setCallUploadProgress(Math.round(p.loaded * 100 / uploadFile.size));
            }
        }).then(
            data => {
                setUploadPending(false);
                setUploadError(null);
                console.log(data.data.message);
                if (data.data.message === 'success') {
                    setUploadFile(null);
                    setCallType('');
                    setProduct('');
                    setLanguageCode('');
                    setCustomerID();
                    setShowCallModal(false);
                    fetchCallList();
                    NotificationManager.success('Success', 'Your call uploaded successfully');
                }
                else {
                    setUploadPending(false);
                    setUploadError(data.message);
                }
            }
        )
    }

    /**
     * Fetch new call supporting information option data which are required to process a call
     */
    function fetchSupportingInfo() {
        services.get('api/call/new_call/').then(res => {
            console.log(res);
            setSupportingInfoPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setSupportingInfoError('Failed to Fetch')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }

                setSupportingInfo(res);
                setSupportingInfoError(null);
            }
        })
    }


    /**
     * Navigate to call insight
     * @param {*} callId Call ID
     * @param {*} intent Intent Value
     */
    function openCallInsight(callId, intent) {
        if (intent !== 0) {
            history.push(`/call/${callId}/call-insight`);
        }
    }


    /**
     * Remove processing failed calls 
     * @param {*} callId Failed call ID
     */
    function removeFailedItem(callId) {
        services.post(`api/call/${callId}/mark_failed/`).then(res => {
            if (res == 'TypeError: Failed to fetch') {
                NotificationManager.error('Error', 'Connection Error');
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                if (res.message === 'success') {
                    NotificationManager.success('Success', 'Removed item');
                    fetchCallList();
                }
            }
        })
    }

    const [sideBarWidth, setSideBarWidth] = useState(0);

    /**\
     * Change side filter bar width
     */
    const changeSideBarWidth = () => {
        if (sideBarWidth == 570) {
            setSideBarWidth(0);
        }
        else {
            setSideBarWidth(570);
        }
    }

    const filterHasChanged = () => {
        fetchCallList();
    }

    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />

            <a onClick={changeSideBarWidth} style={{
                position: "fixed",
                transition: ".5s",
                top: "30%",
                right: sideBarWidth,
                backgroundColor: "#F99E52",
                color: "white",
                borderTopColor: "black",
                borderWidth: "2px",
                boxShadow: "6px 6px 3px #999",
                paddingTop: "15px",
                paddingLeft: "5px",
                paddingRight: "5px",
                height: "45px",
                zIndex: "2"
            }}>
                <FaFilter size="20" />
            </a>
            <Filter width={sideBarWidth} changeSideBarWidth={changeSideBarWidth} filterType="call-list" filterHasChanged={filterHasChanged} />
            {
                sideBarWidth == 570 &&
                <div className="backdrop" style={{ zIndex: 1, height: "2500px" }}></div>
            }


            <NotificationContainer />
            <div className="container-fluid">
                <div className="my-call">
                    <div className="my-calls-column">
                        <div className="calls-top-pannel">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="pannel-heading clearfix">
                                        <div className="pannel-heading-icon"><i className="flaticon-incoming-call"></i></div>
                                        <div className="pannel-heading-info">
                                            <p>Calls </p>
                                            <h3>My Calls</h3>
                                        </div>
                                    </div>
                                    <div className="bradcums">
                                        <ul className="clearfix">
                                            <li> <i className="fa fa-circle" aria-hidden="true"></i> {callList && callList.length} Items</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="pannel-nav clearfix">
                                        <ul className="clearfix">
                                            <li onClick={toggolCallModal}><a>New </a></li>

                                            <li onClick={() => { history.push('/live-call'); }}><a>Live Call </a></li>

                                        </ul>
                                    </div>
                                    <div className="clear"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="call-table">
                        <table className="ss">
                            <thead>
                                <tr>
                                    <th>
                                        <p>
                                            Call Date
                                        </p>
                                    </th>
                                    <th>
                                        <p>Customer</p>
                                    </th>
                                    <th>
                                        <p>Language</p>
                                    </th>
                                    <th>
                                        <p>Product</p>
                                    </th>
                                    <th>
                                        <p>Call Type</p>
                                    </th>
                                    {
                                        localStorage.getItem('collection_module') === 'true' &&
                                        <>
                                            <th>
                                                <p>Agent Recommendation</p>
                                            </th>
                                            <th>
                                                <p>Dataklout Recommendation</p>
                                            </th>
                                        </>
                                    }
                                    <th>
                                        <p>Sentiments</p>
                                    </th>
                                    <th>
                                        <p>Intent</p>
                                    </th>

                                </tr>
                            </thead>
                            {isPending && <tr style={{ height: "400px", textAlignVertical: "center", textAlign: "center", }}>
                                <td colSpan="6">
                                    <ClipLoader color="#2056FF" size="50px" />
                                </td>
                            </tr>
                            }

                            {error &&
                                <tr style={{ textAlignVertical: "center", textAlign: "center", }}>
                                    <td colSpan="6">
                                        <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                            {
                                                error === 'Connection Error' &&
                                                <RiSignalWifiErrorFill />
                                            }
                                            {
                                                error !== 'Connection Error' &&
                                                <BiError />
                                            }
                                            {error}
                                        </p>
                                    </td>
                                </tr>
                            }
                            <tbody>


                                {
                                    callList && (
                                        callList.map((call) => (

                                            <tr key={call._id} onClick={() => openCallInsight(call._id, call._intent)}>

                                                <td>
                                                    {call._date}
                                                </td>
                                                <td>
                                                    {call._customer}
                                                </td>
                                                <td>
                                                    {call._language.includes('English') ? "English" : call._language}
                                                </td>
                                                <td>
                                                    {call._product_name}
                                                </td>
                                                <td>
                                                    {call._call_type}
                                                </td>

                                                {
                                                    localStorage.getItem('collection_module') === 'true' &&
                                                    <>
                                                        {
                                                            call._intent !== 0 &&
                                                            <>
                                                                {
                                                                    call._call_type === 'Collection' ?
                                                                        <>
                                                                            <td>
                                                                                <p>{call._agent_collection_view}</p>
                                                                            </td>
                                                                            <td>
                                                                                <p>{call._dataklout_collection_view}</p>
                                                                            </td>
                                                                        </> :
                                                                        <>
                                                                            <td>
                                                                                <p>NA</p>
                                                                            </td>
                                                                            <td>
                                                                                <p>NA</p>
                                                                            </td>
                                                                        </>

                                                                }
                                                            </>
                                                        }
                                                    </>
                                                }

                                                {
                                                    (call._intent !== 0) &&
                                                    (
                                                        <>
                                                            <td>

                                                                {call._sentiment > 0 ?
                                                                    <p className="red" style={{ color: "green", }}>
                                                                        <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                                    <p className="red" style={{ color: "red", }}>
                                                                        <i className="fa fa-minus-circle" aria-hidden="true" /></p>}

                                                            </td>
                                                            <td>

                                                                {call._intent > 0 ?
                                                                    <p className="red" style={{ color: "green", }}>
                                                                        <i className="fa fa-plus-circle" aria-hidden="true" /></p> :
                                                                    <p className="red" style={{ color: "red", }}>
                                                                        <i className="fa fa-minus-circle" aria-hidden="true" /></p>}

                                                            </td>


                                                        </>
                                                    )

                                                }

                                                {
                                                    (call._intent === 0) && (
                                                        <>
                                                            {
                                                                localStorage.getItem('collection_module') === 'true' &&

                                                                <td colSpan="4" data-toggle="tooltip" data-placement="left" title={call._processing_status}>
                                                                    {
                                                                        call._processing_status !== 'Failed' &&
                                                                        <>
                                                                            <div className="col-md-10">
                                                                                <ProgressBar bgcolor="#271078" progress={call._progress} height={20} />
                                                                            </div>
                                                                            <div className="col-md-2">
                                                                                <PulseLoader color="#2056FF" size="10px" />
                                                                            </div>
                                                                        </>
                                                                    }
                                                                    {
                                                                        call._processing_status === 'Failed' &&
                                                                        <>
                                                                            <BiError size="20px" color="#FF0800" /> Call Processing Failed, Need Action
                                                                    <a onClick={() => removeFailedItem(call._id)} className="pull-right" style={{ color: "red" }}><RiDeleteRow size="20px" /> Remove </a>
                                                                        </>
                                                                    }
                                                                </td>
                                                            }

                                                            {
                                                                localStorage.getItem('collection_module') !== 'true' &&

                                                                <td colSpan="2" data-toggle="tooltip" data-placement="left" title={call._processing_status}>
                                                                    {
                                                                        call._processing_status !== 'Failed' &&
                                                                        <>
                                                                            <div className="col-md-10">
                                                                                <ProgressBar bgcolor="#271078" progress={call._progress} height={20} />
                                                                            </div>
                                                                            <div className="col-md-2">
                                                                                <PulseLoader color="#2056FF" size="10px" />
                                                                            </div>
                                                                        </>
                                                                    }
                                                                    {
                                                                        call._processing_status === 'Failed' &&
                                                                        <>
                                                                            <BiError size="20px" color="#FF0800" /> Call Processing Failed, Need Action
                                                                    <a onClick={() => removeFailedItem(call._id)} className="pull-right" style={{ color: "red" }}><RiDeleteRow size="20px" /> Remove </a>
                                                                        </>
                                                                    }
                                                                </td>
                                                            }
                                                        </>
                                                    )
                                                }



                                            </tr>
                                        ))

                                    )
                                }

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>



            <Footer />

            {
                showCallModal && (
                    <div className="modal my-calls-popup show">
                        <div className="backdrop"></div>
                        <div className="modal-dialog" role="document">
                            <div className="my-calls-popup-details">
                                <h2><div className="icon-div"><div><span><img src="assets/images/user-icon.png" className="img-responsive" alt="" /></span></div></div>Add New Call</h2>


                                <div className="my-calls-form">

                                    {
                                        supportingInfo && (
                                            <div className="row">
                                                <div className="col-md-6">

                                                    <div className="form-col clearfix">
                                                        <label>Call Type </label><br />
                                                        <select onChange={(e) => setCallType(e.target.value)}>
                                                            <option value=""></option>
                                                            {
                                                                supportingInfo.call_type.map((callType) => (
                                                                    <option value={callType.title} >{callType.title}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>

                                                    <div className="form-col clearfix">
                                                        <label>Product </label><br />
                                                        <select onChange={(e) => setProduct(e.target.value)}>
                                                            <option value=""></option>
                                                            {
                                                                supportingInfo.product.map((product) => (
                                                                    <option value={product.title}>{product.title}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>

                                                    <div className="form-col clearfix">
                                                        <label>Language </label><br />
                                                        <select onChange={(e) => setLanguageCode(e.target.value)}>
                                                            <option value=""></option>
                                                            {
                                                                supportingInfo.language.map((languageItem) => (
                                                                    <option value={languageItem.code}>{languageItem.title}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>

                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-col clearfix">
                                                        <label>Customer </label><br />
                                                        <select onChange={(e) => setCustomerID(e.target.value)}>
                                                            <option value=""></option>
                                                            {
                                                                supportingInfo.customer.map((customerItem) => (
                                                                    <option value={customerItem.id}>{customerItem.salutation} {customerItem.first_name} {customerItem.middle_name} {customerItem.last_name}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>

                                                    <div className="form-col clearfix">
                                                        <label>Call Recording </label><br />
                                                        <input type="file" accept=".wav" onChange={e => setUploadFile(e.target.files[0])} />
                                                    </div>

                                                </div>
                                            </div>

                                        )
                                    }

                                    {supportingInfoPending &&
                                        (<div className="empty-call">
                                            Loading...
                                        </div>)}

                                    <div className="row">
                                        <div className="col-md-12">
                                            <p className="errorColor">{supportingInfoError}</p>
                                            {
                                                uploadError &&
                                                <p className="errorColor">{uploadError}</p>
                                            }
                                        </div>
                                    </div>
                                </div>


                                <div className="border"></div>
                                <div className="popup-footer">
                                    {
                                        !uploadPending &&
                                        (
                                            <>
                                                <button className="btn" type="button" onClick={toggolCallModal}> Cancel  </button>
                                                <button className="btn Save" type="button" onClick={uploadCallRecording}> Upload  </button>
                                            </>
                                        )
                                    }

                                    {
                                        uploadPending &&
                                        (
                                            <ProgressBar data-toggle="tooltip" data-placement="top" title="Tooltip on top" bgcolor="#271078" progress={callUploadProgress} height={20} />
                                        )
                                    }

                                </div>
                            </div>

                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default CallList;