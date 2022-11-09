import Header from "./header/header";
import Footer from "./footer/footer";
import NavBar from "./nav/nav-bar";
import "./live-call.css";
import { useEffect, useState, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import Service from './webservice/http';
import ClipLoader from "react-spinners/ClipLoader";
import PulseLoader from "react-spinners/PulseLoader";
import { BiError, BiUserVoice, } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiUserVoiceFill } from 'react-icons/ri';
import { MdOutlineVerifiedUser } from 'react-icons/md';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import reactDom from "react-dom";
import ReactHtmlParser from "react-html-parser";
import useTimer from 'easytimer-react-hook';
import { stringSimilarity } from "string-similarity-js";
//import reactDom from "react-dom";

const LiveCall = () => {
    const history = useHistory();
    const services = new Service();

    const [supportingInfo, setSupportingInfo] = useState(null);
    const [supportingInfoPending, setSupportingInfoPending] = useState();
    const [supportingInfoError, setSupportingInfoError] = useState();
    const [callType, setCallType] = useState('');
    const [product, setProduct] = useState('');
    const [customerID, setCustomerID] = useState('');

    useEffect(() => {
        fetchSupportingInfo();
        fetchCI();
        fetchLiveCallURL();

    }, [])


    /**
     * Fetch live call supporting information which are required to process live call
     */
    function fetchSupportingInfo() {
        setSupportingInfoPending(true);
        setSupportingInfo(null);
        services.get('api/call/new_call/').then(res => {
            console.log(res);
            setSupportingInfoPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setSupportingInfoError('Connection Error')
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


    const [timer, isTargetAchieved] = useTimer({});
    const [callInitiate, setCallInitiate] = useState(false);
    const [callInitiatePending, setCallInitiatePending] = useState(false);

    /**
     * 
     * @returns Initiate Live Call
     */
    const initiateCall = () => {

        if (inbound == false && outbound == false) {
            NotificationManager.warning('Warning', 'Please Select Call Type');
            return;
        }
        setCallInitiatePending(true);
        fetch(`http://${ngrokURL}/call`, { method: 'GET' })
            .then(res => {
                if (res == 'TypeError: Failed to fetch') {
                    NotificationManager.error('Error', 'Failed to Call initiate');
                    setCallInitiatePending(false);
                }
                if (res.ok) {
                    NotificationManager.success('Success', 'Call Initiated');
                    timer.start({});
                    setCallInitiatePending(false);
                    setCallInitiate(true);
                    return res.json()
                }
                else {
                    NotificationManager.error('Error', 'Failed to Call initiate');
                    setCallInitiatePending(false);
                    throw Error('failed to initiate call');
                }

            })
            .then(data => {

            })
            .catch(err => {

            })
    }



    const [socketUrl, setSocketUrl] = useState(null);
    const [messageHistory, setMessageHistory] = useState([]);
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    const [transcriptionData, setTranscriptionData] = useState([]);
    const [transcriptionSentiment, setTranscriptionSentiment] = useState([]);
    const [transcriptionEntities, setTranscriptionEntities] = useState([]);

    const [receivingTranscription, setReceivingTranscription] = useState(false);
    const [inbound, setInbound] = useState(false);
    const [outbound, setOutbound] = useState(false);

    const lastSpeech = useRef(null);
    const lastSentiment = useRef(null);

    const [sentimentString, setSentiemntString] = useState('');
    const [foundConsumablesInsight, setFoundConsumablesInsight] = useState([]);
    const [audioUrl, setAudioUrl] = useState(null);
    const [callDuration, setCallDuration] = useState(null);

    /**
     * Manage transcription on receiving from websocket
     */
    useEffect(() => {
        console.log(lastMessage);
        lastSpeech.current?.scrollIntoView({ behavior: "smooth" });
        lastSentiment.current?.scrollIntoView({ behavior: "smooth" });
        //console.log(timer.getTimeValues);
        //console.log(timer);
        try {
            var data = JSON.parse(lastMessage.data);
            console.log(data.event);
            console.log(data.text);

            var speechArray = transcriptionData;
            var sentimentArray = transcriptionSentiment;
            if (data.event === 'interim-transcription') {
                //handleStart();
                setReceivingTranscription(true);
                if (speechArray.length === 0) {
                    speechArray.push(data.text);
                }
                else {
                    if (data.text.includes(speechArray[speechArray.length - 1])) {
                        speechArray[speechArray.length - 1] = data.text;
                    }
                    else {
                        speechArray.push(data.text);
                    }
                    if (speechArray.length > 1) {
                        var last = speechArray[speechArray.length - 1].toLowerCase();
                        var lastToLast = speechArray[speechArray.length - 2].toLowerCase();
                        if (last.includes(lastToLast)) {
                            speechArray[speechArray.length - 2] = speechArray[speechArray.length - 1];
                            speechArray.splice(speechArray.length - 2, 1);
                        }
                        else {
                            if (stringSimilarity(speechArray[speechArray.length - 2], speechArray[speechArray.length - 1]) > 0.6) {
                                speechArray.splice(speechArray.length - 2, 1);
                            }
                        }
                    }
                }
                sentimentArray.push(data.sentiment);
                setTranscriptionData(speechArray);
                setTranscriptionSentiment(sentimentArray);

                //Populate sentiment div
                console.log(timer.getTimeValues().toString())
                if (data.sentiment >= 0)
                    setSentiemntString(sentimentString + "<p><a style=color:green; font-size:20px;>" + timer.getTimeValues().toString() + " -  POSITIVE</a></p>")
                else
                    setSentiemntString(sentimentString + "<p><a style=color:red; font-size:20px;>" + timer.getTimeValues().toString() + " -  Negative</a></p>")

                reactDom.render(ReactHtmlParser(sentimentString), document.getElementById('sentimentDiv'));

                //Entities
                var ciTemp = foundConsumablesInsight;
                console.log(ciTemp);
                if (data.entities.length > 0) {
                    var entitiesArray = transcriptionEntities;
                    for (let i = 0; i < data.entities.length; i++) {
                        if (entitiesArray.includes(data.entities[i].name) === false) {
                            entitiesArray.push(data.entities[i].name);
                            consumablesInsight.map(ci => {
                                console.log('ci -', ci.keyword.toLowerCase())
                                console.log('en -', data.entities[i].name.toLowerCase())
                                var found = false;
                                for (let j = 0; j < ciTemp.length; j++) {
                                    if (ci.keyword === ciTemp[j].keyword) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (found == false)
                                    if (data.entities[i].name.toLowerCase().includes(ci.keyword.toLowerCase())) {
                                        ciTemp.push(ci);
                                    }

                            })
                        }
                    }
                    setTranscriptionEntities(entitiesArray);
                    setFoundConsumablesInsight(ciTemp);
                }

                consumablesInsight.map(ciItem => {
                    if (data.text.toLowerCase().includes(ciItem.keyword.toLowerCase())) {
                        if (!ciTemp.includes(ciItem)) {
                            ciTemp.push(ciItem)
                        }
                    }
                })


                // consumablesInsight.map(ci => {
                //     if (data.text.toLowerCase().includes(ci.keyword.toLowerCase())) {
                //         if (ciTemp.includes(ci) === false) {
                //             ciTemp.push(ci)
                //         }
                //     }
                // })

                // setFoundConsumablesInsight(ciTemp);

                // var loan_found = false;
                // var quick_loan_found = false;
                // var default_found = false;
                // for (let i = 0; i < ciTemp.length; i++) {
                //     if (ciTemp[i]['keyword'].toLowerCase().includes('quick loan') === true) {
                //         quick_loan_found = true;
                //     }
                //     else if (ciTemp[i]['keyword'].toLowerCase().includes('loan') === true) {
                //         loan_found = true;
                //     }
                //     if (ciTemp[i]['keyword'].toLowerCase().includes('default') === true) {
                //         default_found = true;
                //     }
                // }
                // if (loan_found === true && default_found === false) {
                //     ciTemp.push({ 'keyword': 'default', 'link': '' })
                // }


                setFoundConsumablesInsight(ciTemp);





                lastSpeech.current?.scrollIntoView({ behavior: "smooth" });
                lastSentiment.current?.scrollIntoView({ behavior: "smooth" });
            }
            else if (data.event === 'activity') {
                setReceivingTranscription(false);
                if (data.text === 'Call Has Ended.') {
                    setCallInitiate(false);
                    setCallDuration(timer.getTimeValues().toString());
                    //handleReset();
                    timer.stop();
                    timer.reset();
                }
                try {
                    if (data.audio_url) {
                        setAudioUrl(data.audio_url);
                    }
                } catch { }
                lastSpeech.current?.scrollIntoView({ behavior: "smooth" });
                lastSentiment.current?.scrollIntoView({ behavior: "smooth" });
            }
            console.log(data);
            lastSpeech.current?.scrollIntoView({ behavior: "smooth" });
            lastSentiment.current?.scrollIntoView({ behavior: "smooth" });
            findIntent();
        }
        catch (e) { console.log(e) }
        if (lastMessage !== null) {
            setMessageHistory((prev) => prev.concat(lastMessage));
        }
    }, [lastMessage, setMessageHistory, socketUrl]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const [intent, setIntent] = useState(null);

    /**
     * Intent calculation on live call
     */
    function findIntent() {
        var positiveCount = 0;
        var negativeCount = 0;
        var sentimentArray = transcriptionSentiment;
        sentimentArray.map(sentiment => {
            if (sentiment >= 0) {
                positiveCount++;
            }
            else {
                negativeCount++;
            }
        })
        if (positiveCount > negativeCount) {
            setIntent('Positive')
        }
        else if (negativeCount > positiveCount) {
            setIntent('Negative')
        }
        else {
            setIntent('Neutral');
        }
    }

    const [consumablesInsight, setConsumablesInsight] = useState(null);

    /**
     * Find consumables insight from the live transcription 
     */
    function fetchCI() {
        services.get('api/live_call/consumables_detail/').then(res => {
            if (res == 'TypeError: Failed to fetch') {
                NotificationManager.warning('Warning', 'Failed to load consumables insight !!!');
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                console.log(res);
                setConsumablesInsight(res);
            }
        })
    }


    const [ngrokURL, setNgrokURL] = useState(null);

    /**
     * Fetch changable live call url 
     */
    function fetchLiveCallURL() {
        fetch("http://152.67.25.252:8017/cxlive/ngrok/")
            .then(
                res => res.json()
            )
            .then(
                (result) => {
                    var url = result.ngrok_url;
                    url = url.replace('http://', '');
                    url = url.replace('https://', '');
                    setNgrokURL(url);
                    setSocketUrl(`wss://${url}/`)
                },
                (error) => {
                    console.log(error);
                }
            )
    }

    /**
     *Save live call 
     */
    const saveLiveCall = () => {
        var data = {
            'customer_id': customerID,
            'sentiment': intent,
            'transcription': transcriptionData,
            'call_type_id': callType,
            'product_id': product,
            'keywords': transcriptionEntities,
            'audio_url': audioUrl,
            'call_duration': callDuration,
            'consumables_insight': foundConsumablesInsight
        }
        console.log(data);
        if (customerID === '' || intent === '' || transcriptionData.length == 0 || callType === '' || product === '' || callDuration === '' || callDuration === null) {
            NotificationManager.error('Error', 'Please Perform Call Properly');
            return;
        }

        if (audioUrl === '' || audioUrl === null) {
            NotificationManager.error('Error', 'Please wait till we process audio url');
            return;
        }

        services.post('api/live_call/add_new_call/', data).then(res => {
            if (res == 'TypeError: Failed to fetch') {
                NotificationManager.warning('Warning', 'Please Check your connection once !!!');
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                if (res.call_id) {
                    NotificationManager.success('Success', 'Your Call Has been processed !!!');
                    setIntent(null);
                    setTranscriptionData([]);
                    setTranscriptionEntities([]);
                    setAudioUrl(null);
                    setCallDuration(null);
                    setFoundConsumablesInsight([]);
                    setSentiemntString('');

                    setCallType('');
                    setProduct('');
                    setCustomerID('');
                    fetchSupportingInfo();
                }
                else {
                    NotificationManager.error('Error', res.error);
                }
            }
        })

    }

    useEffect(() => {
        try {
            reactDom.render(ReactHtmlParser(sentimentString), document.getElementById('sentimentDiv'));
        } catch { }
    }, [sentimentString])

    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <NotificationContainer />

            <div id="test"></div>
            <section className="custom-wrapper-glife">
                {
                    supportingInfo &&

                    <div className="container-fluid">
                        <div className="my-call" style={{ boxShadow: "unset", background: "transparent" }}>
                            <div className="my-calls-column" style={{ border: "none", boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)" }}>
                                <div className="calls-top-pannel">
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="pannel-heading clearfix" style={{ padding: 0 }}>
                                                <div className="pannel-heading-icon"><i className="flaticon-incoming-call"></i></div>
                                                <div className="pannel-heading-info">
                                                    <h4>Live Call </h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-5">
                                    <div className="transcription-white-global" >
                                        <div className="transcription-box" style={{ height: "585px" }}>
                                            <div className="transcription-header clearfix">
                                                <div className="pull-left">
                                                    <h4>Transcription</h4>
                                                </div>
                                                <div className="btn-group-callRecords pull-right">
                                                    <input type="radio" id="inbound" name="inbound" value="Inbound" checked={inbound} onChange={() => { setInbound(true); setOutbound(false) }} />
                                                    &nbsp;&nbsp;
                                                    <label htmlFor="inbound" style={{ paddingRight: "20px" }}>Inbound</label>
                                                    <input type="radio" id="outbound" name="outbound" value="Outbound" checked={outbound} onChange={() => { setInbound(false); setOutbound(true) }} />
                                                    &nbsp;&nbsp;
                                                    <label htmlFor="outbound" style={{ paddingRight: "20px" }}>Outbound</label>
                                                    {
                                                        !callInitiate && !callInitiatePending &&
                                                        <button className="btn btn-sm btn-info pull-right" onClick={initiateCall}>Start Call</button>
                                                    }
                                                    {
                                                        callInitiatePending &&
                                                        <button className="btn btn-sm btn-info">Call Initiating</button>
                                                    }
                                                    {
                                                        callInitiate &&
                                                        <button className="btn btn-sm btn-info">Call Initiated</button>
                                                    }
                                                </div>

                                            </div>
                                            <div className="transcription-scrollable" style={{ height: "470px" }}>
                                                <div id="transcriptionDiv">
                                                    {
                                                        transcriptionData &&
                                                        transcriptionData.map((chat, index) => (

                                                            index != (transcriptionData.length - 1) &&
                                                            <div className="bubbleWrapper">
                                                                <div className="inlineContainer other">
                                                                    <div style={{ marginTop: "15px" }}>
                                                                        <RiUserVoiceFill size="25px" color="green" />
                                                                    </div>
                                                                    <div className="otherBubble other">
                                                                        {chat}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        ))
                                                    }
                                                    {
                                                        transcriptionData.length > 0 &&
                                                        !receivingTranscription &&
                                                        <div className="bubbleWrapper">
                                                            <div className="inlineContainer other">
                                                                <div style={{ marginTop: "15px" }}>
                                                                    <RiUserVoiceFill size="25px" color="green" />
                                                                </div>
                                                                <div className="otherBubble other">
                                                                    {transcriptionData[transcriptionData.length - 1]}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    <div ref={lastSpeech} />
                                                </div>
                                            </div>
                                            {
                                                receivingTranscription &&
                                                <div>
                                                    <BiUserVoice size="20px" />
                                                    <a style={{ fontSize: "15px", color: "black" }}>{transcriptionData[transcriptionData.length - 1]} </a>
                                                    <PulseLoader size="5px" />
                                                </div>
                                            }
                                            {

                                                !receivingTranscription &&
                                                callInitiate &&
                                                <div>
                                                    <BiUserVoice size="20px" />
                                                    <a style={{ fontSize: "15px", color: "black" }}> &nbsp;Waiting For Transcription </a>
                                                    <PulseLoader size="5px" />
                                                </div>
                                            }
                                        </div>
                                    </div>

                                </div>
                                <div className="col-lg-7">
                                    <div className="white-box-global ww-caps white-box-global-liveCallInsight">
                                        <div className="white-box-header" style={{ border: "none" }}>
                                            <h3>Call Insights</h3>
                                        </div>
                                        <div className="insights-body clearfix">
                                            <div className="row" style={{ paddingBottom: "20px" }}>
                                                <div className="col-lg-4">
                                                    <div className="insights-box insights-box2-liveCallInsight" style={{ height: "250px" }}>
                                                        <div className="insights-box-header clearfix">
                                                            <h4>Sentiment</h4>
                                                        </div>
                                                        <div className="insights-box-count" style={{ marginTop: "0px" }}>
                                                            <div className="transcription-scrollable" style={{ height: "180px" }}>
                                                                <div id="sentimentDiv" style={{ textAlign: "center", fontSize: "20px" }}></div>
                                                                {/* {
                                                                    transcriptionSentiment &&
                                                                    transcriptionSentiment.map(sentiment => (
                                                                        <>
                                                                            <a>{formatTime()}</a>&nbsp;&nbsp;
                                                                            {
                                                                                sentiment >= 0 &&
                                                                                <a style={{ color: "green", font: "15px" }}>Positive</a>
                                                                            }
                                                                            {
                                                                                sentiment < 0 &&
                                                                                <a style={{ color: "red", font: "15px" }}>Negative</a>
                                                                            }
                                                                            <br />
                                                                        </>
                                                                    ))
                                                                } */}
                                                                <div ref={lastSentiment} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4">
                                                    <div className="insights-box insights-box2-liveCallInsight" style={{ height: "250px" }}>
                                                        <div className="insights-box-header clearfix">
                                                            <h4>Consumable Insight</h4>
                                                        </div>
                                                        <div className="insights-box-count " style={{ textAlign: "center" }}>
                                                            {
                                                                foundConsumablesInsight &&
                                                                foundConsumablesInsight.map(fci => (

                                                                    fci.link != '' ?
                                                                        <>
                                                                            <a href={fci.link} target="_blank" style={{ color: "green", fontSize: "15px" }}>{fci.keyword}</a><br />
                                                                        </>
                                                                        :
                                                                        <>
                                                                            <a style={{ fontSize: "15px" }}>{fci.keyword}</a><br />
                                                                        </>

                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4">
                                                    <div className="insights-box insights-box2-liveCallInsight" style={{ height: "250px" }}>
                                                        <div className="insights-box-header clearfix">
                                                            <h4>Intent</h4>
                                                        </div>
                                                        <div className="insights-box-count" style={{ textAlign: "center" }}>
                                                            {
                                                                intent === 'Positive' &&
                                                                <p style={{ color: "green", fontSize: "40px" }}>{intent}</p>
                                                            }
                                                            {
                                                                intent === 'Negative' &&
                                                                <p style={{ color: "red", fontSize: "40px" }}>{intent}</p>
                                                            }
                                                            {
                                                                intent === 'Neutral' &&
                                                                <p style={{ color: "blue", fontSize: "40px" }}>{intent}</p>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <div className="keyword-body" style={{ height: "350px" }}>
                                                        <div className="top-keywords-box-header clearfix">
                                                            <h4>Top Keywords</h4>
                                                        </div>
                                                        <div className="keyword-body">
                                                            {
                                                                transcriptionEntities.map((keyword) => (
                                                                    <h3>{keyword}</h3>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-4">
                                                    <div className="insights-box insights-box2-liveCallInsight" style={{ height: "350px" }}>
                                                        <div className="" style={{ padding: "1% 3%" }}>
                                                            {
                                                                supportingInfo && (
                                                                    <div >
                                                                        <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>

                                                                            <div className="form-col clearfix">
                                                                                <label>Call Type </label><br />
                                                                                <select onChange={(e) => setCallType(e.target.value)}>
                                                                                    <option value=""></option>
                                                                                    {
                                                                                        supportingInfo.call_type.map((callType) => (
                                                                                            <option value={callType.id} >{callType.title}</option>
                                                                                        ))
                                                                                    }
                                                                                </select>
                                                                            </div>

                                                                        </div>
                                                                        <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                            <div className="form-col clearfix">
                                                                                <label>Product </label><br />
                                                                                <select onChange={(e) => setProduct(e.target.value)}>
                                                                                    <option value=""></option>
                                                                                    {
                                                                                        supportingInfo.product.map((product) => (
                                                                                            <option value={product.id}>{product.title}</option>
                                                                                        ))
                                                                                    }
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
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
                                                                        </div>
                                                                        <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px", paddingBottom: "10px", paddingTop: "none" }}>
                                                                            <div className="popup-footer">
                                                                                <button className="btn Save pull-right" type="button" onClick={saveLiveCall}> Save  </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                )
                                                            }
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
                }

                {supportingInfoPending && <div className="empty-call">
                    <ClipLoader color="#2056FF" size="50px" />
                </div>
                }

                {supportingInfoError && <div className="empty-call">
                    <p style={{ fontSize: "25px", color: "#FF8520" }}>
                        {
                            supportingInfoError === 'Connection Error' &&
                            <RiSignalWifiErrorFill />
                        }
                        {
                            supportingInfoError !== 'Connection Error' &&
                            <BiError />
                        }
                        {supportingInfoError}
                    </p>
                </div>
                }
            </section>
            <Footer />
        </div>
    );
}
export default LiveCall;