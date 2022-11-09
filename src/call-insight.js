import Header from "./header/header";
import Footer from "./footer/footer";
import NavBar from "./nav/nav-bar";
import { useHistory, useParams } from "react-router";
import './call-insight.css';
import WebPull from "./webservice/web-pull";
import Service from './webservice/http';
import { useEffect, useState } from 'react';
//import Wavesurfer from "react-wavesurfer.js";
//import Timeline from "react-wavesurfer.js";
import { Link } from "react-router-dom";
//import MiniMap from "wavesurfer.js/dist/plugin/wavesurfer.minimap";
//import Timeline from "wavesurfer.js/dist/plugin/wavesurfer.timeline";
//import Timeline from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.js';
//import Wavesurfer from '../node_modules/react-wavesurfer/src/react-wavesurfer';
//import Timeline from "../node_modules/react-wavesurfer/src/plugins/timeline";

import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
import React, {
    useCallback,
    useRef,
    useMemo
} from "react";
import NavbarCollapse from "react-bootstrap/esm/NavbarCollapse";
import ReactDOM from 'react-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';
import { FcCustomerSupport } from 'react-icons/fc';
import { MdPendingActions } from 'react-icons/md';
import { BsCheckLg } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';
import { FiEdit } from 'react-icons/fi';
import { BiArchiveIn } from 'react-icons/bi';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import Highlighter from "react-highlight-words";

const CallInsight = () => {
    const { callID } = useParams();
    const history = useHistory();

    //const { data: callInsight, error, isPending } = WebPull(`https://fb.dataklout.com/api/call/${callID}/call_insight/`)
    const [callInsight, setCallInsight] = useState(null);
    const [error, setError] = useState('');
    const [isPending, setIsPending] = useState(false);
    const services = new Service();

    const [isLanguageEnglish, setIsLanguageEnglish] = useState(true);
    const [displayEnglish, setDisplayEnglish] = useState(true);
    var english = true;
    var ci = null;

    /**
     * Fetch Call Insight data
     */
    function fetchData() {
        setError('');
        setIsPending(true);
        setCallInsight(null);
        services.get(`api/call/${callID}/call_insight/`).then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setCallInsight(res);
                if (res.language !== 'English') {
                    setIsLanguageEnglish(false);
                    setDisplayEnglish(false);
                    english = false;
                }

                ci = res;
                setError('');
                try {
                    wavesurferRef.current.load(res.audio_file);
                }
                catch { }
            }
        })
    }

    const [agentVariance, setAgentVariance] = useState(null);
    const [customerVariance, setCustomerVariance] = useState(null);
    const [agentLoudness, setAgentLoudness] = useState(null);
    const [customerLoudness, setCustomerLoudness] = useState(null);
    const [agentEntropy, setAgentEntropy] = useState(null);
    const [customerEntropy, setCustomerEntropy] = useState(null);
    const [agentEnergy, setAgentEnergy] = useState(null);
    const [customerEnergy, setCustomerEnergy] = useState(null);

    const [criticalFactor, setCriticalFactor] = useState(null);

    function fetchCriticalFactorData() {
        services.get(`api/call/${callID}/critical_factor/`).then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setCriticalFactor(res);
                setProblem(res.problem);
                setResolution(res.resolution);
            }
        })
    }

    const [problem, setProblem] = useState('');
    const [resolution, setResolution] = useState('');
    function criticalValueSelectionChnage(type, id) {
        var tempCriticalFactor = criticalFactor;
        if (type === 'product') {
            var products = tempCriticalFactor.product;
            for (let i = 0; i < products.length; i++) {
                if (products[i].id === id) {
                    products[i].status = true
                }
                else {
                    products[i].status = false
                }
            }
            tempCriticalFactor.product = products;
        }

        if (type === 'manufacturer') {
            var manufacturer = tempCriticalFactor.manufacturer;
            for (let i = 0; i < manufacturer.length; i++) {
                if (manufacturer[i].id === id) {
                    manufacturer[i].status = true
                }
                else {
                    manufacturer[i].status = false
                }
            }
            tempCriticalFactor.manufacturer = manufacturer;
        }

        if (type === 'part_no') {
            var part_no = tempCriticalFactor.part_no;
            for (let i = 0; i < part_no.length; i++) {
                if (part_no[i].id === id) {
                    part_no[i].status = true
                }
                else {
                    part_no[i].status = false
                }
            }
            tempCriticalFactor.part_no = part_no;
        }

        if (type === 'model_no_list') {
            var model_no_list = tempCriticalFactor.model_no_list;
            for (let i = 0; i < model_no_list.length; i++) {
                if (model_no_list[i].id === id) {
                    model_no_list[i].status = true
                }
                else {
                    model_no_list[i].status = false
                }
            }
            tempCriticalFactor.model_no_list = model_no_list;
        }

        setCriticalFactor(tempCriticalFactor);
        console.log(criticalFactor)
    }


    const updateCriticalFactor = () => {
        var selected_product = '';
        var selected_manufacturer = '';
        var selected_part_no = '';
        var selected_model = '';

        for (let i = 0; i < criticalFactor.product.length; i++) {
            if (criticalFactor.product[i].status === true) {
                selected_product = criticalFactor.product[i].id;
            }
        }
        for (let i = 0; i < criticalFactor.manufacturer.length; i++) {
            if (criticalFactor.manufacturer[i].status === true) {
                selected_manufacturer = criticalFactor.manufacturer[i].id;
            }
        }
        for (let i = 0; i < criticalFactor.part_no.length; i++) {
            if (criticalFactor.part_no[i].status === true) {
                selected_part_no = criticalFactor.part_no[i].id;
            }
        }
        for (let i = 0; i < criticalFactor.model_no_list.length; i++) {
            if (criticalFactor.model_no_list[i].status === true) {
                selected_model = criticalFactor.model_no_list[i].id;
            }
        }
        var data = {
            "problem": problem,
            "resolution": resolution,
            "product": selected_product,
            "manufacturer": selected_manufacturer,
            "partNo": selected_part_no,
            "modelNo": selected_model
        }

        services.post(`api/call/${callID}/critical_factor/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                NotificationManager.success('Success', 'Critical Factor updated');
            }
        })
    }

    // useEffect(() => {
    //     console.log(criticalFactor);
    // }, [criticalFactor]);

    useEffect(() => {

        fetchData();
        //buildFilter();
        if (localStorage.getItem('critical_factor_module') === 'true') {
            fetchCriticalFactorData();
        }


        console.log(callInsight);
        fetchSupportingInfo();
    }, [history]);



    /**
     * After fetching call insight data, process that data to display in required format
     */

    useEffect(() => {
        var i = 0;
        for (i = 0; i < 2; i++) {
            try {
                if (callInsight.pitch_variance[i].Speaker === 'agent') {
                    setAgentVariance(callInsight.pitch_variance[i].pitchvar);
                }
                if (callInsight.pitch_variance[i].Speaker === 'customer') {
                    setCustomerVariance(callInsight.pitch_variance[i].pitchvar);
                }
                if (callInsight.loudness[i].speaker === 'agent') {
                    setAgentLoudness(callInsight.loudness[i].loudness);
                }
                if (callInsight.loudness[i].speaker === 'customer') {
                    setCustomerLoudness(callInsight.loudness[i].loudness);
                }
                if (callInsight.entropy[i].speaker === 'agent') {
                    setAgentEntropy(callInsight.entropy[i].entropy);
                }
                if (callInsight.entropy[i].speaker === 'customer') {
                    setCustomerEntropy(callInsight.entropy[i].entropy);
                }
                if (callInsight.energy[i].speaker === 'agent') {
                    setAgentEnergy(callInsight.energy[i].energy);
                }
                if (callInsight.energy[i].speaker === 'customer') {
                    setCustomerEnergy(callInsight.energy[i].energy);
                }
                if (callInsight.call_type === 'Collection') {
                    fetchCollectionStatusData();
                }
            }
            catch {

            }
        }
    }, [callInsight,])

    const [collectionStatusData, setCollectionStatusData] = useState(null);

    /**
     * Fetch current status of collection if it is a collection call 
     */
    function fetchCollectionStatusData() {
        services.get(`api/call/${callID}/collection_status/`).then(res => {
            console.log(res)
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                setCollectionStatusData(res);
                setCollectionStatus(res.updated_status)
            }
        })
    }


    const [showCollectionReviewDetails, setShowCollectionReviewDetails] = useState(false);
    useEffect(() => {
        fetchCollectionStatusData();
    }, [showCollectionReviewDetails])
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };

    const [collectionStatus, setCollectionStatus] = useState('');
    const [comment, setComment] = useState('');
    const [accepted, setAccepted] = useState(false);

    /**
     * Update current status of collection
     */
    function updateCollectionStatusData() {
        if (callInsight.agent_id === localStorage.getItem('username')) {
            var data = {
                type: 'agent',
                updated_status: collectionStatus
            }
        }
        if (callInsight.agent_id !== localStorage.getItem('username')) {
            var data = {
                type: 'manager',
                status_id: collectionStatusData.id,
                accepted: accepted,
                comment: comment
            }
        }
        services.post(`api/call/${callID}/collection_status/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setShowCollectionReviewDetails(false);
            }
        })
    }

    useEffect(() => {
        buildFilter();
    }, [callInsight]);

    const [emotions, setEmotions] = useState(null);
    const [speakers, setSpeakers] = useState(null);

    /**
     * filter speech region based on selected speaker and selected emotiom
     * It is required to display filter range
     * @param {*} filter_type Filter Type
     * @param {*} filter Filter
     */
    function regionFilterFun(filter_type, filter) {
        var regionData = [];
        if (callInsight != null) {
            var i = 1;
            callInsight.speech.map(speechItem => {
                if (filter_type == 'speaker') {
                    if (filter == 'agent') {
                        if (speechItem.speaker == 'agent') {
                            regionData.push(
                                {
                                    id: "region-" + i.toString(),
                                    start: speechItem.startTime,
                                    end: speechItem.endTime,
                                    color: "rgba(255, 196, 226, 0.4)",
                                    data: {
                                        systemRegionId: i
                                    }
                                }
                            )
                        }
                    }
                    else {
                        if (speechItem.speaker == 'customer') {
                            regionData.push(
                                {
                                    id: "region-" + i.toString(),
                                    start: speechItem.startTime,
                                    end: speechItem.endTime,
                                    color: "rgba(255, 255, 0, 0.4)",
                                    data: {
                                        systemRegionId: i
                                    }
                                }
                            )
                        }
                    }
                }
                else {
                    if (filter == 'Happy') {
                        if (speechItem.emotion == 'Happy') {
                            regionData.push(
                                {
                                    id: "region-" + i.toString(),
                                    start: speechItem.startTime,
                                    end: speechItem.endTime,
                                    color: "rgba(0,228,255,0.2)",
                                    data: {
                                        systemRegionId: i
                                    }
                                }
                            )
                        }
                    }
                    else if (filter == 'Fearful') {
                        if (speechItem.emotion == 'Fearful') {
                            regionData.push(
                                {
                                    id: "region-" + i.toString(),
                                    start: speechItem.startTime,
                                    end: speechItem.endTime,
                                    color: "rgba(0,64,255,0.2)",
                                    data: {
                                        systemRegionId: i
                                    }
                                }
                            )
                        }
                    }
                    else if (filter == 'Angry') {
                        if (speechItem.emotion == 'Angry') {
                            regionData.push(
                                {
                                    id: "region-" + i.toString(),
                                    start: speechItem.startTime,
                                    end: speechItem.endTime,
                                    color: "rgba(58,255,0,0.2)",
                                    data: {
                                        systemRegionId: i
                                    }
                                }
                            )
                        }
                    }
                    else if (filter == 'Sad') {
                        if (speechItem.emotion == 'Sad') {
                            regionData.push(
                                {
                                    id: "region-" + i.toString(),
                                    start: speechItem.startTime,
                                    end: speechItem.endTime,
                                    color: "rgba(255,0,255,0.2)",
                                    data: {
                                        systemRegionId: i
                                    }
                                }
                            )
                        }
                    }
                    else {
                        if (speechItem.emotion == 'Calm') {
                            regionData.push(
                                {
                                    id: "region-" + i.toString(),
                                    start: speechItem.startTime,
                                    end: speechItem.endTime,
                                    color: "rgba(255,0,0,0.2)",
                                    data: {
                                        systemRegionId: i
                                    }
                                }
                            )
                        }
                    }
                }
                i++;
            })

            setRegions(regionData);
        }
    }


    /**
     * Build filter options
     */
    function buildFilter() {
        var emotions = [];
        var speakers = [];
        if (callInsight != null) {
            callInsight.speech.map(speechItem => {
                if (emotions.indexOf(speechItem.emotion) === -1) {
                    emotions.push(speechItem.emotion);
                }
                if (speakers.indexOf(speechItem.speaker) === -1) {
                    speakers.push(speechItem.speaker);
                }
            });
        }
        setEmotions(emotions);
        setSpeakers(speakers);
    }


    /**
     * Control audio play and pause status
     */
    const play = useCallback(() => {
        wavesurferRef.current.playPause();
    }, []);


    const [regions, setRegions] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);



    const [timelineVis, setTimelineVis] = useState(true);
    const wavesurferRef = useRef();
    const regionsRef = useRef(regions);
    const plugins = useMemo(() => {
        return [
            {
                plugin: RegionsPlugin,
                options: { dragSelection: true }
            },
            timelineVis && {
                plugin: TimelinePlugin,
                options: {
                    container: "#timeline",
                    color: "#000000",
                    fontSize: "25px"
                }
            }
        ].filter(Boolean);
    }, [timelineVis]);


    /**
     * Create region on audio web graph
     */
    const regionCreatedHandler = useCallback(
        region => {
            console.log("region-created --> region:", region);

            if (region.data.systemRegionId) return;

            setRegions([
                ...regionsRef.current,
                { ...region, data: { ...region.data, systemRegionId: -1 } }
            ]);
        },
        [regionsRef]
    );


    /**
     * Load audio packets and create webgraph
     */
    const handleWSMount = useCallback(
        waveSurfer => {
            wavesurferRef.current = waveSurfer;
            if (wavesurferRef.current) {


                wavesurferRef.current.params.waveColor = "#2196f3";
                wavesurferRef.current.params.progressColor = "#000000";
                wavesurferRef.current.params.backgroundColor = "#0000";
                wavesurferRef.current.params.responsive = true;
                wavesurferRef.current.params.fillParent = true;
                wavesurferRef.current.params.scrollParent = true;
                wavesurferRef.current.setHeight(210);



                wavesurferRef.current.on("region-created", regionCreatedHandler);

                wavesurferRef.current.on("ready", () => {
                    console.log("WaveSurfer is ready");
                });

                wavesurferRef.current.on("region-removed", region => {
                    console.log("region-removed --> ", region);
                });

                wavesurferRef.current.on("loading", data => {
                    console.log("loading --> ", data);
                });

                wavesurferRef.current.on("play", () => {
                    setIsPlaying(true);
                });

                wavesurferRef.current.on("pause", () => {
                    try {
                        ReactDOM.render("", document.getElementById('transcriptionDiv'));
                        setIsPlaying(false);
                    } catch { }
                });

                wavesurferRef.current.on("audioprocess", () => {
                    var t = waveSurfer.getCurrentTime();
                    setPlayTime(t);
                });

                wavesurferRef.current.on("finish", () => {
                    ReactDOM.render("", document.getElementById('transcriptionDiv'));
                    setIsPlaying(false);
                });

                if (window) {
                    window.surferidze = wavesurferRef.current;
                }
            }
        },
        [regionCreatedHandler,]
    );


    /**
     * Manage region update in webgraph
     */
    const handleRegionUpdate = useCallback((region, smth) => {
        console.log("region-update-end --> region:", region);
        console.log(smth);
    }, []);


    const [playTime, setPlayTime] = useState(null);


    /**
     * Handle transcription display while playing the audio and on change of language togglge
     */
    useEffect(() => {
        console.log(playTime);
        try {
            console.log(displayEnglish);
            var speech = callInsight.speech;
            for (let i = 0; i < speech.length; i++) {
                if (playTime >= speech[i].startTime && playTime <= speech[i].endTime) {
                    var dialogue = '';
                    if (displayEnglish)
                        dialogue = speech[i].dialogue
                    else
                        dialogue = speech[i].early_dialogue
                    if (speech[i].speaker === 'agent') {
                        ReactDOM.render(<div className="transcription-customer-section clearfix">
                            <h4>Agent
                                </h4>
                            <div className="customer-info-right">
                                <span>{speech[i].startTime}</span>
                                <p>
                                    <Highlighter
                                        highlightClassName="YourHighlightClass"
                                        searchWords={[callInsight.product]}
                                        autoEscape={true}
                                        textToHighlight={dialogue}
                                    />
                                </p>
                                <span>{speech[i].endTime}</span>
                            </div>
                        </div>, document.getElementById('transcriptionDiv'));
                    }
                    else {
                        ReactDOM.render(<div className="transcription-customer-section clearfix">
                            <h4>Customer</h4>
                            <div className="customer-info-right">
                                <span>{speech[i].startTime}</span>
                                <p>
                                    <Highlighter
                                        highlightClassName="YourHighlightClass"
                                        searchWords={[callInsight.product]}
                                        autoEscape={true}
                                        textToHighlight={dialogue}
                                    />
                                </p>
                                <span>{speech[i].endTime}</span>
                            </div>
                        </div>, document.getElementById('transcriptionDiv'));
                    }
                    break;
                }
            }
        }
        catch (e) { console.log(e); }
    }, [playTime, displayEnglish])


    useEffect(() => {
        return () => {
            try {
                wavesurferRef.current.pause();
            }
            catch { }
        }
    }, [])

    const [showArchiveModel, setShowArchiveModel] = useState(false);
    function markArchive() {
        var data = {
            'archive_status': true
        }
        services.post(`/api/call/${callID}/mark_archive/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                NotificationManager.success('Success', 'Task Closed');
                setShowArchiveModel(false);
            }
        })
    }

    const [showOpportunitySRModel, setShowOpportunitySRModel] = useState(false);
    const [clickType, setClickType] = useState(null);

    function clickOpportunitySRModel(type) {
        setClickType(type);
        setShowOpportunitySRModel(true);
    }


    /**
        * Fetch product list from new call supporting info API
    */
    const [supportingInfo, setSupportingInfo] = useState();
    function fetchSupportingInfo() {
        services.get('api/call/new_call/').then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setSupportingInfo(res);
            }
        })
    }

    const [productID, setProductID] = useState(null);
    const [keyword, setkeyword] = useState(null);
    const [status, setStatus] = useState(null);

    function CreateOpportunitySR() {
        if (productID === null || keyword === null || status === '') {
            NotificationManager.error('Error', 'All the fields are mandatory');
        }
        else {
            var data = {
                "product_id": productID,
                "keyword": keyword,
                "review_status": status
            }
            if (clickType === 'Opportunity') {
                services.post(`/api/call/${callID}/create_opportunity/`, data).then(res => {
                    console.log(res);
                    if (res == 'TypeError: Failed to fetch') {
                        console.log("failed to fetch user");
                    }
                    else {
                        NotificationManager.success('Success', 'Opportunity Creatred');
                        setShowOpportunitySRModel(false);
                        setProductID(null);
                        setkeyword(null);
                        setStatus(null);
                    }
                })
            }
            else {
                services.post(`/api/call/${callID}/create_service_request/`, data).then(res => {
                    console.log(res);
                    if (res == 'TypeError: Failed to fetch') {
                        console.log("failed to fetch user");
                    }
                    else {
                        NotificationManager.success('Success', 'Service Requested Creatred');
                        setShowOpportunitySRModel(false);
                        setProductID(null);
                        setkeyword(null);
                        setStatus(null);
                    }
                })
            }
        }
    }

    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <NotificationContainer />
            <section className="custom-wrapper-glife">
                <div className="container-fluid">
                    <div className="my-call" >


                        {isPending && (
                            <div className="empty-call" style={{ height: "500px" }}>
                                <ClipLoader color="#2056FF" size="50px" />
                            </div>
                        )}

                        {error && (
                            <div className="empty-call" style={{ height: "500px" }}>
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
                            </div>
                        )}

                        {callInsight &&
                            (<div>
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-lg-12">
                                                <div className="pannel-heading clearfix div-padding">
                                                    <div className="pannel-heading-icon"><i className="flaticon-incoming-call"></i></div>
                                                    <div className="pannel-heading-info">
                                                        <p>Call Insight </p>
                                                        <h3 className="detail-heading">
                                                            Customer: <span className="detail-heading-span">{callInsight.customer}</span>
                                                            <span><span >(Ref# :{callInsight.call_reference})</span></span>
                                                            <img src="/assets/images/blur-circle-check.png" />
                                                        </h3>

                                                    </div>
                                                    <div className="pull-right">
                                                        <button onClick={() => setShowArchiveModel(true)}>
                                                            <BiArchiveIn size="30" />
                                                        </button>
                                                        &nbsp;&nbsp;
                                                        {
                                                            callInsight.call_type === 'Opportunity' &&
                                                            <button className="btn btn-info pull-right" onClick={() => clickOpportunitySRModel('Opportunity')}>New Opportunity</button>
                                                        }

                                                        {
                                                            callInsight.call_type === 'Service Request' &&
                                                            <button className="btn btn-info pull-right" onClick={() => clickOpportunitySRModel('Service Request')}>New Service Request</button>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="white-box-global ww-caps">
                                            <div className="white-box-header">
                                                <Link to={`/call/${callID}/deep-analysis`}>
                                                    <button className="btn btn-info pull-right">Deep Analysis</button>
                                                </Link>
                                                <h3>Call Insights</h3>

                                            </div>
                                            <div className="insights-body clearfix">
                                                <div className="row">
                                                    <div className="col-lg-3">
                                                        <div className="insights-box">
                                                            <div className="insights-box-header clearfix">
                                                                <h4>CX Score</h4>
                                                                <img src="assets/images/cx-icon.png" className="img-responsive" alt="" />
                                                            </div>
                                                            <div className="insights-box-count">
                                                                <h2>{callInsight.cx_score} &nbsp;%</h2>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="insights-box">
                                                            <div className="insights-box-header clearfix">
                                                                <h4>Issues/Problem <br />Found</h4>
                                                                <img src="assets/images/customer-icon.png" className="img-responsive" alt="" />
                                                            </div>
                                                            <div className="insights-box-count">
                                                                <h2>{callInsight.problen ? "Yes" : "No"}</h2>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="insights-box">
                                                            <div className="insights-box-header clearfix">
                                                                <h4>Customer <br /> Intent</h4>
                                                                <img src="assets/images/agreeability-icon.png" className="img-responsive" alt="" />
                                                            </div>
                                                            <div className="insights-box-count">
                                                                <h2>{callInsight.intent > 0 ? "Positive" : "Negative"}</h2>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-3">
                                                        <div className="insights-box">
                                                            <div className="insights-box-header clearfix">
                                                                <h4>Resolution</h4>
                                                                <img src="assets/images/resolution-icon.png" className="img-responsive" alt="" />
                                                            </div>
                                                            <div className="insights-box-count">
                                                                <h2>{callInsight.resolution ? "Yes" : "No"}</h2>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="white-box-global call-records">
                                            <div className="row" >
                                                <div className="col-md-6">
                                                    <div className="white-box-header">
                                                        <h3>Call Duration : {callInsight.duration}</h3>
                                                    </div>
                                                </div>
                                                <div className="col-md-6" style={{ padding: "10px", paddingRight: "20px" }}>
                                                    <input className="pull-right btn btn-info" type="submit" onClick={play} value={isPlaying ? "Pause" : "Play"} />
                                                </div>
                                            </div>
                                            <div className="row" style={{ height: "250px", paddingLeft: "20px", paddingRight: "20px" }}>
                                                {
                                                    !isPending &&

                                                    <WaveSurfer plugins={plugins} onMount={handleWSMount} scrollParent="true">
                                                        <div id="timeline" />
                                                        <WaveForm id="waveform">
                                                            {regions.map(regionProps => (
                                                                <Region
                                                                    onUpdateEnd={handleRegionUpdate}
                                                                    key={regionProps.id}
                                                                    {...regionProps}
                                                                />
                                                            ))}
                                                        </WaveForm>

                                                    </WaveSurfer>
                                                }
                                            </div>
                                            <div className="row">
                                                <div style={{ textAlign: "center" }}>
                                                    {
                                                        speakers &&
                                                        speakers.map(speaker => (
                                                            <>
                                                                {speaker == "agent" &&
                                                                    <>
                                                                        <a onClick={() => regionFilterFun("speaker", "agent")} style={{ cursor: "cell", backgroundColor: "rgba(255, 196, 226, 0.4)", fontSize: "15px", color: "black", padding: "8px", borderRadius: "15px" }}>Agent</a>
                                                                    &nbsp;
                                                                </>
                                                                }

                                                                {
                                                                    speaker == "customer" &&
                                                                    <>
                                                                        <a onClick={() => regionFilterFun("speaker", "customer")} style={{ cursor: "cell", backgroundColor: "rgba(255, 255, 0, 0.4)", fontSize: "15px", color: "black", padding: "8px", borderRadius: "15px" }}>Customer</a>
                                                                    &nbsp;
                                                                </>
                                                                }
                                                            </>
                                                        ))
                                                    }
                                                    <a style={{ fontSize: "20px" }}>&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;</a>
                                                    {
                                                        emotions &&
                                                        emotions.map(emotion => (
                                                            <>
                                                                {emotion == "Happy" &&
                                                                    <>
                                                                        <a onClick={() => regionFilterFun("emotion", "Happy")} style={{ cursor: "cell", backgroundColor: "rgba(0,228,255,0.2)", fontSize: "15px", color: "black", padding: "8px", borderRadius: "15px" }}>Happy</a>
                                                                    &nbsp;
                                                                </>
                                                                }

                                                                {
                                                                    emotion == "Fearful" &&
                                                                    <>
                                                                        <a onClick={() => regionFilterFun("emotion", "Fearful")} style={{ cursor: "cell", backgroundColor: "rgba(0,64,255,0.2)", fontSize: "15px", color: "black", padding: "8px", borderRadius: "15px" }}>Fearful</a>
                                                                    &nbsp;
                                                                </>
                                                                }

                                                                {
                                                                    emotion == "Angry" &&
                                                                    <>
                                                                        <a onClick={() => regionFilterFun("emotion", "Angry")} style={{ cursor: "cell", backgroundColor: "rgba(58,255,0,0.2)", fontSize: "15px", color: "black", padding: "8px", borderRadius: "15px" }}>Angry</a>
                                                                    &nbsp;
                                                                </>
                                                                }

                                                                {
                                                                    emotion == "Sad" &&
                                                                    <>
                                                                        <a onClick={() => regionFilterFun("emotion", "Sad")} style={{ cursor: "cell", backgroundColor: "rgba(255,0,255,0.2)", fontSize: "15px", color: "black", padding: "8px", borderRadius: "15px" }}>Sad</a>
                                                                    &nbsp;
                                                                </>
                                                                }

                                                                {
                                                                    emotion == "Calm" &&
                                                                    <>
                                                                        <a onClick={() => regionFilterFun("emotion", "Calm")} style={{ cursor: "cell", backgroundColor: "rgba(255,0,0,0.2)", fontSize: "15px", color: "black", padding: "8px", borderRadius: "15px" }}>Calm</a>
                                                                    &nbsp;
                                                                </>
                                                                }
                                                            </>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            {/* <Wavesurfer
                                                src={callInsight.audio_file}
                                                position={position}
                                                onPositionChange={handlePositionChange}
                                                onReady={onReadyHandler}
                                                muted={muted}
                                                playing={playing}
                                                zoomLevel={zoomLevel}
                                                options={waveOptions}
                                            >
                                                <Timeline options={timelineOptions} />
                                            </Wavesurfer> */}
                                            {/* {!playing && <button className="btn btn-info center-block" onClick={handlePlayPause}><i className="fa fa-play-circle" aria-hidden="true"></i> &nbsp;Play</button>}
                                            {playing && <button className="btn btn-success center-block" onClick={handlePlayPause}><i className="fa fa-pause-circle" aria-hidden="true"></i> &nbsp;Pause</button>} */}
                                            <br />
                                        </div>
                                        <div className="transcription-white-global" style={{ paddingBottom: "10px" }}>
                                            <div className="transcription-box">
                                                <div className="transcription-header clearfix">
                                                    <h4>Transcription</h4>
                                                    <div className="toggle-switch">
                                                        <label>
                                                            {
                                                                isLanguageEnglish &&
                                                                "English"
                                                            }
                                                            {
                                                                !isLanguageEnglish && displayEnglish &&
                                                                "English"
                                                            }
                                                            {
                                                                !isLanguageEnglish && !displayEnglish &&
                                                                callInsight.language
                                                            }
                                                        </label>
                                                        {
                                                            callInsight.language !== 'English' &&
                                                            (
                                                                <div className="toggle-switch-intregrate">
                                                                    <input type="checkbox" id="switch" onChange={() => { setDisplayEnglish(!displayEnglish); english = !english; }} /> <label htmlFor="switch"></label>
                                                                </div>
                                                            )
                                                        }

                                                    </div>
                                                </div>
                                                <div className="transcription-scrollable">
                                                    {
                                                        isPlaying ?
                                                            <div id="transcriptionDiv">

                                                            </ div> :
                                                            <div className="transcription-info-wrapper clearfix">
                                                                {
                                                                    callInsight.speech.map((transcription) => (

                                                                        (transcription.speaker) === 'agent' ?
                                                                            (<div className="transcription-customer-section clearfix">
                                                                                <h4>Agent </h4>
                                                                                <div className="customer-info-right">
                                                                                    <span>{transcription.startTime}</span>
                                                                                    {
                                                                                        displayEnglish ?
                                                                                            <p>
                                                                                                <Highlighter
                                                                                                    highlightClassName="YourHighlightClass"
                                                                                                    searchWords={[callInsight.product]}
                                                                                                    autoEscape={true}
                                                                                                    textToHighlight={transcription.dialogue}
                                                                                                />

                                                                                            </p> :
                                                                                            <p>{transcription.early_dialogue}</p>
                                                                                    }
                                                                                    <span>{transcription.endTime}</span>
                                                                                </div>
                                                                            </div>)
                                                                            :
                                                                            (<div className="transcription-customer-section clearfix">
                                                                                <h4>Customer</h4>
                                                                                <div className="customer-info-right">
                                                                                    <span>{transcription.startTime}</span>
                                                                                    {
                                                                                        displayEnglish ?
                                                                                            <p>
                                                                                                <Highlighter
                                                                                                    highlightClassName="YourHighlightClass"
                                                                                                    searchWords={[callInsight.product]}
                                                                                                    autoEscape={true}
                                                                                                    textToHighlight={transcription.dialogue}
                                                                                                />
                                                                                            </p> :
                                                                                            <p>{transcription.early_dialogue}</p>
                                                                                    }
                                                                                    <span>{transcription.endTime}</span>
                                                                                </div>
                                                                            </div>)

                                                                    ))
                                                                }
                                                            </div>
                                                    }
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                    <div className="col-lg-6">
                                        <div className="white-box-global">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="wwp-text">
                                                        <h4>
                                                            <span>Agent Sentiment : </span>
                                                            {
                                                                callInsight.agent_sentiment > 0 ?
                                                                    <i className="fa fa-plus-circle" style={{ color: "green", }} aria-hidden="true" /> :
                                                                    <i className="fa fa-minus-circle" style={{ color: "red", }} aria-hidden="true" />
                                                            }
                                                            &nbsp;
                                                            {Math.abs((callInsight.agent_sentiment * 100).toFixed(2))} %
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="wwp-text align-right">
                                                        <h4>
                                                            <span>Customer Sentiment : </span>
                                                            {
                                                                callInsight.customer_sentiment > 0 ?
                                                                    <i className="fa fa-plus-circle" style={{ color: "green", }} aria-hidden="true" /> :
                                                                    <i className="fa fa-minus-circle" style={{ color: "red", }} aria-hidden="true" />
                                                            }
                                                            &nbsp;
                                                            {Math.abs((callInsight.customer_sentiment * 100).toFixed(2))} %
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="white-box-global analysis-white-box">
                                            <div className="white-box-header">
                                                <h3>Sentiment Analysis</h3>
                                            </div>
                                            <div className="sentiment-body">
                                                <h4>Voice</h4>
                                                <div className="wrapperinfo-table">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Parameters</th>
                                                                <th>Agent</th>
                                                                <th>Customer</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>Pitch Variance</td>
                                                                <td>{agentVariance}</td>
                                                                <td>{customerVariance}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Loudness</td>
                                                                <td>{agentLoudness}</td>
                                                                <td>{customerLoudness}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Entropy</td>
                                                                <td>{agentEntropy}&nbsp;%</td>
                                                                <td>{customerEntropy}&nbsp;%</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Zero Cross Rate</td>
                                                                <td colSpan="2" className="ZCRtd">
                                                                    <div className="ZCRdiv" >
                                                                        In Progress <br />
                                                                        <img src="/assets/images/loading.png" className="img-responsive" alt="" />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>Total Agreeability</td>
                                                                <td colSpan="2" className="ZCRtd">{callInsight.tone_result.agreeableness}&nbsp;%</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Total disagreeability</td>
                                                                <td colSpan="2" className="ZCRtd">{callInsight.tone_result.disagreeableness}&nbsp;%</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Energy</td>
                                                                <td>{agentEnergy}</td>
                                                                <td>{customerEnergy}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><h4>Text</h4></td>
                                                            </tr>
                                                            <tr>
                                                                <td>Sentiment %</td>
                                                                <td>{(callInsight.agent_sentiment * 100).toFixed(2)} &nbsp;%</td>
                                                                <td>{(callInsight.customer_sentiment * 100).toFixed(2)}&nbsp;%</td>
                                                            </tr>
                                                            <tr>
                                                                <td>Sentiment Keywords</td>
                                                                <td colSpan="2">
                                                                    {(callInsight.sentiment_keywords).map((keyword) => (
                                                                        <a>{keyword}</a>
                                                                    ))}

                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <br />
                                                    <br />
                                                    <br />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6">
                                        {
                                            localStorage.getItem('critical_factor_module') === 'true' ?
                                                <div className="white-box-global">
                                                    <div className="white-box-header">
                                                        <h3>Service Report</h3>
                                                    </div>
                                                    <div className="call-category-body">
                                                        <div className="call-category-form">
                                                            {
                                                                criticalFactor &&

                                                                <div className="row">
                                                                    <div className="col-md-4">
                                                                        <div className="form-col clearfix">
                                                                            <label>Request Type</label>
                                                                            <input type="text" name="" placeholder="Request Type" value={callInsight.call_type} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="form-col clearfix">
                                                                            <label>Product</label>
                                                                            <select onChange={(e) => criticalValueSelectionChnage('product', e.target.value)}>
                                                                                <option></option>
                                                                                {
                                                                                    criticalFactor.product.map(productItem => (
                                                                                        productItem.status ?
                                                                                            <option value={productItem.id} selected>{productItem.title}</option> :
                                                                                            <option value={productItem.id}>{productItem.title}</option>
                                                                                    ))
                                                                                }
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="form-col clearfix">
                                                                            <label>Manufacturer</label>
                                                                            <select onChange={(e) => criticalValueSelectionChnage('manufacturer', e.target.value)}>
                                                                                <option></option>
                                                                                {
                                                                                    criticalFactor.manufacturer.map(manufacturerItem => (
                                                                                        manufacturerItem.status ?
                                                                                            <option value={manufacturerItem.id} selected>{manufacturerItem.title}</option> :
                                                                                            <option value={manufacturerItem.id}>{manufacturerItem.title}</option>
                                                                                    ))
                                                                                }
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="form-col clearfix">
                                                                            <label>Part No</label>
                                                                            <select onChange={(e) => criticalValueSelectionChnage('part_no', e.target.value)}>
                                                                                <option></option>
                                                                                {
                                                                                    criticalFactor.part_no.map(partNoItem => (
                                                                                        partNoItem.status ?
                                                                                            <option value={partNoItem.id} selected>{partNoItem.title}</option> :
                                                                                            <option value={partNoItem.id}>{partNoItem.title}</option>
                                                                                    ))
                                                                                }
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="form-col clearfix">
                                                                            <label>Model</label>
                                                                            <select onChange={(e) => criticalValueSelectionChnage('model_no_list', e.target.value)}>
                                                                                <option></option>
                                                                                {
                                                                                    criticalFactor.model_no_list.map(model_no_listItem => (
                                                                                        model_no_listItem.status ?
                                                                                            <option value={model_no_listItem.id} selected>{model_no_listItem.title}</option> :
                                                                                            <option value={model_no_listItem.id}>{model_no_listItem.title}</option>
                                                                                    ))
                                                                                }
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-4">
                                                                        <div className="form-col clearfix">
                                                                            <label>Problem</label>
                                                                            <input type="text" value={problem} onChange={(e) => setProblem(e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <div className="form-col clearfix">
                                                                            <label>Resolution</label>
                                                                            <input type="text" value={resolution} onChange={(e) => setResolution(e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <div className="review-button">
                                                                            <input type="submit" name="" value="Update" onClick={updateCriticalFactor} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                :
                                                <>
                                                    {
                                                        callInsight.call_type === 'Collection' ?

                                                            <div className="white-box-global" style={{ height: "330px" }}>
                                                                <div className="white-box-header">
                                                                    <div className="pull-left"><h3>Collection Status</h3></div>
                                                                    <div className="pull-right">
                                                                        <h3>
                                                                            Manager's Review &nbsp;&nbsp;
                                                                {
                                                                                collectionStatusData &&
                                                                                <>
                                                                                    {
                                                                                        collectionStatusData.accepted === null &&
                                                                                        <MdPendingActions color="orange" />
                                                                                    }
                                                                                    {
                                                                                        collectionStatusData.accepted === true &&
                                                                                        <BsCheckLg color="green" />
                                                                                    }
                                                                                    {
                                                                                        collectionStatusData.accepted === false &&
                                                                                        <FaTimes color="red" />
                                                                                    }
                                                                                </>
                                                                            }
                                                                &nbsp;&nbsp;
                                                                <FiEdit onClick={() => setShowCollectionReviewDetails(!showCollectionReviewDetails)} />
                                                                        </h3>
                                                                    </div>
                                                                </div>
                                                                <div className="call-category-body">
                                                                    <div className="call-category-form">
                                                                        <div className="row" style={{ paddingTop: "30px" }}>
                                                                            <div className="col-md-3">
                                                                                <div className="input-form  pull-right">
                                                                                    <img style={{ marginTop: "20px" }} src="/assets/images/favicon.png" className="img-responsive" alt="" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <div className="input-form pull-left" >
                                                                                    <label style={{ marginTop: "50px" }}>{callInsight.dataklout_collection_view}</label>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <div className="input-form pull-right" >
                                                                                    <FcCustomerSupport size="80" style={{ marginTop: "20px" }} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <div className="input-form pull-left" >
                                                                                    <label style={{ marginTop: "50px" }}>{collectionStatusData && collectionStatusData.updated_status}</label>
                                                                                </div>
                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            :
                                                            <div className="white-box-global" style={{ height: "330px" }}>
                                                                <div className="white-box-header">
                                                                    <h3>Call Category</h3>
                                                                </div>
                                                                <div className="call-category-body">
                                                                    <div className="call-category-form">
                                                                        <div className="row">
                                                                            <div className="col-md-6">
                                                                                <div className="input-form">
                                                                                    <label>Request Type</label>
                                                                                    <input type="text" name="" placeholder="Request Type" value={callInsight.call_type} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-6">
                                                                                <div className="input-form">
                                                                                    <label>Product</label>
                                                                                    <input type="text" name="" placeholder="Product" value={callInsight.product} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-6">
                                                                                <div className="input-form">
                                                                                    <label>Category</label>
                                                                                    <input type="text" name="" placeholder="Category" value={callInsight.category} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-6">
                                                                                <div className="review-button">
                                                                                    <input type="submit" name="" value="Save" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                    }
                                                </>
                                        }
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="white-box-global keyword-white-box">
                                            <div className="white-box-header">
                                                <h3>Top Keywords</h3>
                                            </div>
                                            <div className="keyword-body">
                                                {
                                                    callInsight.keywords.map((keyword) => (
                                                        <h3>{keyword}</h3>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>)}
                    </div>
                </div>
            </section>
            <Footer />

            <Modal
                isOpen={showCollectionReviewDetails}
                style={customStyles}
            >
                <div className="modal-dialog" role="document" >
                    <div className="my-calls-popup-details">
                        <h2><div className="icon-div"><div><i style={{ color: "white" }} className="fa fa-user" aria-hidden="true"></i></div></div>Collection Status</h2>
                        <div className="my-calls-form">
                            <div className="row">
                                <div className="col-md-12">
                                    {
                                        callInsight && callInsight.agent_id === localStorage.getItem('username') &&
                                        <>
                                            {
                                                collectionStatusData && collectionStatusData.accepted === null &&
                                                <p>
                                                    Manager's Action : Pending
                                            </p>
                                            }
                                            {
                                                collectionStatusData && collectionStatusData.accepted !== null &&
                                                <>
                                                    <div className="form-col clearfix">
                                                        <label>Manager's Action :  </label>
                                                        {
                                                            collectionStatusData.accepted === true &&
                                                            <BsCheckLg color="green" />
                                                        }
                                                        {
                                                            collectionStatusData.accepted === false &&
                                                            <FaTimes color="red" />
                                                        }
                                                    </div>

                                                    <div className="form-col clearfix">

                                                        <label>Comment </label><br />
                                                        <p><b>{collectionStatusData.comment}</b></p>
                                                    </div>
                                                </>
                                            }
                                            <div className="form-col clearfix">
                                                <label>Collection Status </label><br />
                                                <select onChange={e => setCollectionStatus(e.target.value)}>
                                                    <option value={collectionStatus}>{collectionStatus}</option>
                                                    <option value="Promise Broken">Promise Broken</option>
                                                    <option value="Denial">Denial</option>
                                                    <option value="Settlement">Settlement</option>
                                                </select>
                                            </div>
                                        </>
                                    }



                                    {
                                        callInsight && callInsight.agent_id !== localStorage.getItem('username') &&
                                        <>
                                            <div className="form-col clearfix">
                                                <label>Current Status </label><br />
                                                <p><b>{collectionStatusData && collectionStatusData.updated_status}</b></p>
                                            </div>

                                            {
                                                collectionStatusData &&
                                                <>
                                                    <div className="form-col clearfix">
                                                        <label>Accept </label>
                                                        <div className="toggle-switch">
                                                            <div className="toggle-switch-intregrate">
                                                                <input type="checkbox" id="switch" onChange={() => setAccepted(!accepted)} /> <label htmlFor="switch"></label>
                                                            </div>
                                                        </div>
                                                    </div>


                                                    <div className="form-col clearfix">
                                                        <label>Comment </label><br />
                                                        <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} />
                                                    </div>
                                                </>
                                            }
                                        </>
                                    }



                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <p className="errorColor"></p>
                                </div>
                            </div>
                        </div>
                        <div className="border"></div>
                        <div className="popup-footer">

                            <>
                                <button className="btn" type="button" onClick={() => setShowCollectionReviewDetails(!showCollectionReviewDetails)}> Cancel  </button>
                                <button className="btn Save" type="button" onClick={() => updateCollectionStatusData()} > Update  </button>
                            </>

                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showArchiveModel}
                style={customStyles}
            >
                <div className="modal-dialog" role="document" >
                    <div className="my-calls-popup-details">
                        <h2>Do you want to Archive this call ?</h2>

                        <div className="popup-footer">

                            <>
                                <button className="btn" type="button" onClick={() => setShowArchiveModel(false)}> Cancel  </button>
                                <button className="btn Save" type="button" onClick={() => markArchive()} > Confirm  </button>
                            </>

                        </div>
                    </div>
                </div>
            </Modal>


            {
                showOpportunitySRModel && (
                    <div className="modal my-calls-popup show">
                        <div className="backdrop"></div>
                        <div className="modal-dialog" role="document">
                            <div className="my-calls-popup-details">
                                <h2><div className="icon-div"><div><span><img src="assets/images/user-icon.png" className="img-responsive" alt="" /></span></div></div>Create New {clickType}</h2>


                                <div className="my-calls-form">


                                    <div className="row">
                                        <div className="col-md-3"></div>
                                        <div className="col-md-6">

                                            <div className="form-col clearfix">
                                                <label>Product </label><br />
                                                <select onChange={(e) => setProductID(e.target.value)}>
                                                    <option value=""></option>
                                                    {
                                                        supportingInfo.product.map((product) => (
                                                            <option value={product.id}>{product.title}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>

                                            <div className="form-col clearfix">
                                                <label>Keyword </label><br />
                                                <input type="text" value={keyword} onChange={(e) => setkeyword(e.target.value)} />
                                            </div>

                                            <div className="form-col clearfix">
                                                <label>Status </label><br />
                                                <select onChange={(e) => setStatus(e.target.value)}>
                                                    <option value=""></option>
                                                    <option value="New">New</option>

                                                </select>
                                            </div>

                                        </div>
                                    </div>

                                    {/* {supportingInfoPending &&
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
                                    </div> */}
                                </div>


                                <div className="border"></div>
                                <div className="popup-footer">
                                    <>
                                        <button className="btn" type="button" onClick={() => setShowOpportunitySRModel(false)}> Cancel  </button>
                                        <button className="btn Save" type="button" onClick={() => CreateOpportunitySR()}> Create  </button>
                                    </>
                                </div>
                            </div>

                        </div>
                    </div>
                )
            }

        </div>
    );
}

export default CallInsight;