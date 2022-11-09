import Header from "./header/header";
import Footer from "./footer/footer";
import NavBar from "./nav/nav-bar";
import { useHistory, useParams } from "react-router";
import { useDebugValue, useEffect, useState } from 'react';
import WebPull from "./webservice/web-pull";
//import Wavesurfer from "react-wavesurfer.js";
import Service from './webservice/http';
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
import { BiHappyAlt } from 'react-icons/bi';
import { FaRegSadTear } from 'react-icons/fa';
import { BsEmojiNeutral, BsEmojiAngry, BsEmojiDizzy, BsConeStriped } from 'react-icons/bs';
import ClipLoader from "react-spinners/ClipLoader";
import { BiError, BiCommentAdd, BiTaskX } from 'react-icons/bi';
import { RiSignalWifiErrorFill, RiDeleteRow } from 'react-icons/ri';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

const DeepAnalysis = () => {
    const { callID } = useParams();
    const history = useHistory();

    //const { data: deepAnalysis, error, isPending } = WebPull(`https://fb.dataklout.com/api/call/${callID}/deep_analysis/`);
    const [deepAnalysis, setDeepAnalysis] = useState(null);
    const [error, setError] = useState('');
    const [isPending, setIsPending] = useState(false);

    const [isLanguageEnglish, setIsLanguageEnglish] = useState(true);
    const [displayEnglish, setDisplayEnglish] = useState(true);
    var da = '';

    /**
     * Fetch Deep Analysis Data
     */
    function fetchData() {
        setError('');
        setIsPending(true);
        services.get(`api/call/${callID}/deep_analysis/`).then(res => {
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

                setDeepAnalysis(res);
                if (res.language !== 'English') {
                    setIsLanguageEnglish(false);
                    setDisplayEnglish(false);
                }
                da = res;
                setError('');
                try {
                    wavesurferRef.current.load(res.audio_file);
                }
                catch { }
            }
        })
    }

    const [customer_engagement, setCustomerEngagement] = useState(0);
    var engagement_score = 0;
    var recommendation = '';
    const consumables_insight = [];
    const [consumables_insight_array, setCIArray] = useState([]);

    const [showModal, setShowModal] = useState(false);

    const toggleModal = () => {
        setShowModal(!showModal);

    }
    const services = new Service();

    const [reviewData, setReviewData] = useState(null);
    const [reviewDataLoading, setReviewDataLoading] = useState(false);
    const [reviewDataLoadingError, setReviewDataLoadingError] = useState(null);

    const [selectedStartTime, setSelectedStartTime] = useState('');
    const [selectedEndTime, setSelectedEndTime] = useState('');

    /**
     * Fetch Review data for a specific time frame
     * @param {*} startTime Start Time
     * @param {*} endTime End Time
     */
    function fetchReviewData(startTime, endTime) {
        setShowModal(true);

        setReviewData(null);
        setReviewDataLoading(true);
        setReviewDataLoadingError(null);
        setSelectedStartTime(startTime);
        setSelectedEndTime(endTime);

        services.get(`/api/call/${callID}/deep_analysis/${startTime}/${endTime}/reviews/`).then(res => {
            console.log(res);
            setReviewDataLoading(false);
            if (res == 'TypeError: Failed to fetch') {
                setReviewDataLoadingError('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }

                setReviewData(res);
                setReviewDataLoadingError(null);
            }
        })
    }

    const [newReview, setNewReview] = useState('');


    const [postPending, setPostPending] = useState(false);
    const [postError, setPostError] = useState(null);

    /**
     * Add new call review for a specific time frame of call
     * @param {*} startTime Start Time
     * @param {*} endTime End Time
     */
    function addNewReview(startTime, endTime) {
        if (newReview === '') {
            setPostError('Please add some review');
            return;
        }
        setPostPending(true);
        setPostError(null);
        var reviewData = {
            start_time: startTime,
            end_time: endTime,
            comment: newReview
        }
        services.post(`/api/call/${callID}/deep_analysis/add_review/`, reviewData).then(res => {
            console.log(res);
            setPostPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setPostError('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                if (res.message === 'success') {
                    fetchReviewData(startTime, endTime);
                    setNewReview('');
                    NotificationManager.success('Success', 'Add Your Comment');
                    fetchData();
                    setShowModal(false);
                }
                else {
                    setPostError(res.errorMessage);
                }
            }

        })

    }

    var [audio] = useState();
    //const [playing, setPlaying] = useState(false);

    //const audio = new Audio();


    /**
     * Handle audio url of splitted calls
     * @param {*} audio_url Audio Url String
     */
    function handleSubAudio(audio_url) {
        console.log(audio_url);
        try {
            audio.pause();
        } catch { }
        audio = new Audio(audio_url);
        audio.play();
    }

    useEffect(() => {

        fetchData();


    }, [history,]);


    /**
     * After fetching deep analysis data, process that data to display in required format
     */
    useEffect(() => {
        try {
            engagement_score = 0
            engagement_score = deepAnalysis.cx_score * 20 / 100;

            if (deepAnalysis.customer_sentiment > 0) {
                engagement_score = engagement_score + 20;
            }
            engagement_score = engagement_score + (deepAnalysis.tone_result['agreeableness'] * 10 / 100)
            if (deepAnalysis.experience['greeting']) {
                engagement_score = engagement_score + 10;
            }

            if (deepAnalysis.experience['introduction']) {
                engagement_score = engagement_score + 10;
            }

            if (deepAnalysis.experience['problem_statement']) {
                engagement_score = engagement_score + 10;
            }

            if (deepAnalysis.experience['closing_text']) {
                engagement_score = engagement_score + 10;
            }

            if (deepAnalysis.experience['closing_question']) {
                engagement_score = engagement_score + 10;
            }

            setCustomerEngagement(engagement_score);


            recommendation = deepAnalysis.experience['recomendation'];
            recommendation.map((reco_item) => {
                reco_item.recomendation.map((item) => {
                    console.log(item.recomendation)
                    // if (item.recomendation !== '') {

                    consumables_insight.push({
                        'startTime': reco_item.startTime,
                        'endTime': reco_item.endTime,
                        'keyword': item.keyword,
                        'recommendation': item.recomendation
                    })
                    // }
                })
            })
            setCIArray(consumables_insight);
            console.log(consumables_insight);
            //setReviewArray(deepAnalysis.review);

        }
        catch (error) {
            //console.log(error);
            setCustomerEngagement(-10);
        }
        buildFilter();
    }, [deepAnalysis]);

    const [emotions, setEmotions] = useState(null);
    const [speakers, setSpeakers] = useState(null);


    /**
     * filter speech region based on selected speaker and selected emotiom
     * It is required to display filter range
     * @param {*} filter_type Call Type
     * @param {*} filter Filter Value
     */

    function regionFilterFun(filter_type, filter) {
        var regionData = [];
        if (deepAnalysis != null) {
            var i = 1;
            deepAnalysis.deep_analysis_data.map(speechItem => {
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
        if (deepAnalysis != null) {
            deepAnalysis.deep_analysis_data.map(speechItem => {
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


    /**
     * Control audio play and pause status
     */
    useEffect(() => {
        return () => {
            wavesurferRef.current.pause();
        }
    }, [])

    const [regions, setRegions] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);



    //const [timelineVis, setTimelineVis] = useState(true);
    const wavesurferRef = useRef();
    const regionsRef = useRef(regions);
    const plugins = useMemo(() => {
        return [
            {
                plugin: RegionsPlugin,
                options: { dragSelection: true }
            },
            {
                plugin: TimelinePlugin,
                options: {
                    container: "#timeline",
                    color: "#000000",
                    fontSize: "25px"
                }
            },
        ].filter(Boolean);
    }, []);


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

    const [showSpecTranscription, setShowSpecTranscription] = useState(false);

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
                //wavesurferRef.current.params.scrollParent = true;
                wavesurferRef.current.setHeight(170);



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
                    setShowSpecTranscription(true);
                });

                wavesurferRef.current.on("pause", () => {
                    //ReactDOM.render("", document.getElementById('deepAnalysisTranscriptionDiv'));
                    setIsPlaying(false);
                });

                wavesurferRef.current.on("audioprocess", () => {
                    var t = waveSurfer.getCurrentTime();
                    setPlayTime(t);
                    //handlePlayTime(t);
                    setShowSpecTranscription(true);
                });

                wavesurferRef.current.on("finish", () => {
                    ReactDOM.render("", document.getElementById('deepAnalysisTranscriptionDiv'));
                    setIsPlaying(false);
                    setShowSpecTranscription(false);
                });

                if (window) {
                    window.surferidze = wavesurferRef.current;
                }
            }
        },
        [regionCreatedHandler]
    );


    const [playTime, setPlayTime] = useState(null);

    /**
     * Handle transcription display while playing the audio and on change of language togglge
     */
    useEffect(() => {
        try {
            var speech = deepAnalysis.deep_analysis_data;
            for (let i = 0; i < speech.length; i++) {
                if (playTime >= speech[i].startTime && playTime <= speech[i].endTime) {
                    var item = speech[i];
                    ReactDOM.render(
                        <div className="conversation-column clearfix">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="conversation-header-left">
                                        <div className="conversation-count">{item.startTime} - {item.endTime}</div>
                                        <div className="conversation-title"><span>{item.speaker}</span></div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="conversation-header-right">
                                        <a onClick={() => fetchReviewData(item.startTime, item.endTime)} className="icon-button"><b>{item.review.length > 0 ? item.review.length : ''}</b>&nbsp;<img src="/assets/images/note-edit.png" className="img-responsive" alt="" /></a>
                                        <a onClick={() => handleSubAudio(item.audio)} className="text-button">Play</a>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="call-records-info">
                                        <p>{displayEnglish ? item.dialogue : item.early_dialogue}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">

                                <div className="col-md-12">
                                    <div className="call-records-info-half clearfix">
                                        <div className="call-records-info-half-wrapper clearfix">
                                            <div className="call-records-info-half-wrapper-box">
                                                <div className="icon-half"><img src="/assets/images/img1.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Energy</span><br />{item.energy}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half" style={{ fontSize: "35px" }}>
                                                    {
                                                        item.emotion === 'Happy' &&
                                                        <BiHappyAlt />
                                                    }
                                                    {
                                                        item.emotion === 'Sad' &&
                                                        <FaRegSadTear />
                                                    }
                                                    {
                                                        item.emotion === 'Calm' &&
                                                        <BsEmojiNeutral />
                                                    }
                                                    {
                                                        item.emotion === 'Angry' &&
                                                        <BsEmojiAngry />
                                                    }
                                                    {
                                                        item.emotion === 'Fearful' &&
                                                        <BsEmojiDizzy />
                                                    }
                                                </div>
                                                <div className="icon-ionfo"><h5><span>Emotion</span><br />{item.emotion}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img3.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Entropy</span><br />{item.entropy}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img4.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Loudness</span><br />{item.loudness}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img5.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Sentiment</span><br />{item.sentiment}</h5></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        , document.getElementById('deepAnalysisTranscriptionDiv'));

                    break;
                }
            }
        }
        catch (e) { console.log(e); }
    }, [playTime, displayEnglish, showSpecTranscription])


    /**
     * Manage region update in webgraph
     */
    const handleRegionUpdate = useCallback((region, smth) => {
        console.log("region-update-end --> region:", region);
        console.log(smth);
    }, []);

    function handlePlayTime(time) {

    }

    /**
    * Filter deep analysis data based on emotion 
    * @param {*} emotion Emotion Value
    */

    function speechEmotionFilter(emotion) {
        try {
            setShowSpecTranscription(true);
            if (isPlaying) {
                wavesurferRef.current.playPause();
                setIsPlaying(false);
            }
            var filteredSpeech = []

            var speech = deepAnalysis.deep_analysis_data;
            for (let i = 0; i < speech.length; i++) {
                var item = speech[i];
                if (item.emotion === emotion) {
                    filteredSpeech.push(
                        <div className="conversation-column clearfix">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="conversation-header-left">
                                        <div className="conversation-count">{item.startTime} - {item.endTime}</div>
                                        <div className="conversation-title"><span>{item.speaker}</span></div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="conversation-header-right">
                                        <a onClick={() => fetchReviewData(item.startTime, item.endTime)} className="icon-button"><b>{item.review.length > 0 ? item.review.length : ''}</b>&nbsp;<img src="/assets/images/note-edit.png" className="img-responsive" alt="" /></a>
                                        <a onClick={() => handleSubAudio(item.audio)} className="text-button">Play</a>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="call-records-info">
                                        <p>{displayEnglish ? item.dialogue : item.early_dialogue}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">

                                <div className="col-md-12">
                                    <div className="call-records-info-half clearfix">
                                        <div className="call-records-info-half-wrapper clearfix">
                                            <div className="call-records-info-half-wrapper-box">
                                                <div className="icon-half"><img src="/assets/images/img1.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Energy</span><br />{item.energy}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half" style={{ fontSize: "35px" }}>
                                                    {
                                                        item.emotion === 'Happy' &&
                                                        <BiHappyAlt />
                                                    }
                                                    {
                                                        item.emotion === 'Sad' &&
                                                        <FaRegSadTear />
                                                    }
                                                    {
                                                        item.emotion === 'Calm' &&
                                                        <BsEmojiNeutral />
                                                    }
                                                    {
                                                        item.emotion === 'Angry' &&
                                                        <BsEmojiAngry />
                                                    }
                                                    {
                                                        item.emotion === 'Fearful' &&
                                                        <BsEmojiDizzy />
                                                    }
                                                </div>
                                                <div className="icon-ionfo"><h5><span>Emotion</span><br />{item.emotion}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img3.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Entropy</span><br />{item.entropy}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img4.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Loudness</span><br />{item.loudness}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img5.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Sentiment</span><br />{item.sentiment}</h5></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    )
                }
            }

            ReactDOM.render(filteredSpeech, document.getElementById('deepAnalysisTranscriptionDiv'));
        }
        catch (e) { console.log(e); }
    }


    /**
     * Filter Deep Analysis data based on time 
     * @param {*} startTime Start Time
     */
    function speechTimeFilter(startTime) {
        try {
            console.log(startTime)
            if (isPlaying) {
                wavesurferRef.current.playPause();
                setIsPlaying(false);
            }
            var filteredSpeech = []

            var speech = deepAnalysis.deep_analysis_data;
            for (let i = 0; i < speech.length; i++) {
                var item = speech[i];
                if (item.startTime == startTime) {
                    filteredSpeech.push(
                        <div className="conversation-column clearfix">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="conversation-header-left">
                                        <div className="conversation-count">{item.startTime} - {item.endTime}</div>
                                        <div className="conversation-title"><span>{item.speaker}</span></div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="conversation-header-right">
                                        <a onClick={() => fetchReviewData(item.startTime, item.endTime)} className="icon-button"><b>{item.review.length > 0 ? item.review.length : ''}</b>&nbsp;<img src="/assets/images/note-edit.png" className="img-responsive" alt="" /></a>
                                        <a onClick={() => handleSubAudio(item.audio)} className="text-button">Play</a>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="call-records-info">
                                        <p>{displayEnglish ? item.dialogue : item.early_dialogue}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">

                                <div className="col-md-12">
                                    <div className="call-records-info-half clearfix">
                                        <div className="call-records-info-half-wrapper clearfix">
                                            <div className="call-records-info-half-wrapper-box">
                                                <div className="icon-half"><img src="/assets/images/img1.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Energy</span><br />{item.energy}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half" style={{ fontSize: "35px" }}>
                                                    {
                                                        item.emotion === 'Happy' &&
                                                        <BiHappyAlt />
                                                    }
                                                    {
                                                        item.emotion === 'Sad' &&
                                                        <FaRegSadTear />
                                                    }
                                                    {
                                                        item.emotion === 'Calm' &&
                                                        <BsEmojiNeutral />
                                                    }
                                                    {
                                                        item.emotion === 'Angry' &&
                                                        <BsEmojiAngry />
                                                    }
                                                    {
                                                        item.emotion === 'Fearful' &&
                                                        <BsEmojiDizzy />
                                                    }
                                                </div>
                                                <div className="icon-ionfo"><h5><span>Emotion</span><br />{item.emotion}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img3.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Entropy</span><br />{item.entropy}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img4.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Loudness</span><br />{item.loudness}</h5></div>
                                            </div>
                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                <div className="icon-half"><img src="/assets/images/img5.png" className="img-responsive" alt="" /></div>
                                                <div className="icon-ionfo"><h5><span>Sentiment</span><br />{item.sentiment}</h5></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    )
                }
            }
            setShowSpecTranscription(true);
            ReactDOM.render(filteredSpeech, document.getElementById('deepAnalysisTranscriptionDiv'));
        } catch (e) { console.log(e); }
    }


    const [showEmotion, setShowEmotion] = useState(false);
    const [posX, setPosX] = useState();
    const [posY, setPosY] = useState();
    const [momentEmotion, setMomentEmotion] = useState(null);


    /**
     * Handle mouse handover and populate different emotion emojis on audio webgraph
     * @param {*} mousePointer Mouse Pointer Location
     */
    function handleMouseOver(mousePointer) {
        var hoverTime = (mousePointer.nativeEvent.offsetX / wavesurferRef.current.drawer.width) * wavesurferRef.current.getDuration();
        var waveTime = formatTime(hoverTime);
        var speech = deepAnalysis.deep_analysis_data;
        for (let i = 0; i < speech.length; i++) {
            var item = speech[i];
            if (item.startTime <= hoverTime && item.endTime >= hoverTime) {
                setMomentEmotion(item.emotion)
            }
        }
        setPosX(mousePointer.nativeEvent.pageX);
        setPosY(mousePointer.nativeEvent.pageY)
        setShowEmotion(true);
        console.log(hoverTime);
    }

    var formatTime = function (time) {
        return [
            Math.floor((time % 3600) / 60), // minutes
            ('00' + Math.floor(time % 60)).slice(-2) // seconds
        ].join('.');
    };


    /**
     * Change audio transcription script language based on request
     * @param {*} e Event Object
     */
    const changeLanguage = (e) => {
        console.log("cl----------")
        if (e.target.value !== 'English') {
            setDisplayEnglish(false);
        }
        else {
            setDisplayEnglish(true);
        }
        setShowSpecTranscription(false);
    }

    const [mainReview, setMainReview] = useState('');


    /**
     * Add call review for the over all call
     */
    const AddMainReview = () => {
        if (mainReview !== '') {
            var reviewData = {
                start_time: -1,
                end_time: -1,
                comment: mainReview
            }
            services.post(`/api/call/${callID}/deep_analysis/add_review/`, reviewData).then(res => {
                console.log(res);
                setPostPending(false);
                if (res == 'TypeError: Failed to fetch') {
                    setPostError('Connection Error')
                }
                else {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    if (res.message === 'success') {
                        fetchData();
                        setMainReview('');
                        NotificationManager.success('Success', 'Add Your Comment');
                    }
                    else {
                        setPostError(res.errorMessage);
                    }
                }

            })
        }
    }


    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <NotificationContainer />

            {
                showEmotion &&
                <div style={{ fontSize: "40px", position: "absolute", zIndex: "4", left: posX + 'px', top: posY + 'px' }}>
                    {
                        momentEmotion === 'Happy' &&
                        <>&#128512;</>
                    }
                    {
                        momentEmotion === 'Sad' &&
                        <>&#128546;</>
                    }
                    {
                        momentEmotion === 'Calm' &&
                        <>&#128528;</>
                    }
                    {
                        momentEmotion === 'Angry' &&
                        <>&#128544;</>
                    }
                    {
                        momentEmotion === 'Fearful' &&
                        <>&#128561;</>
                    }
                </div>
            }
            <section className="custom-wrapper-glife">
                <div className="container-fluid">
                    <div className="my-call">

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
                        {deepAnalysis && (<div>
                            <div className="my-calls-column">
                                <div className="calls-top-pannel">
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="pannel-heading clearfix" style={{ Padding: 0, }}>
                                                <div className="pannel-heading-icon"><i className="flaticon-incoming-call"></i></div>
                                                <div className="pannel-heading-info">
                                                    <p>Deep Analaysis </p>
                                                    <h3>Customer: <span>{deepAnalysis.customer}</span>  <span><span>(Ref# :</span> <span>{deepAnalysis.call_reference})</span></span> <img src="/assets/images/blur-circle-check.png" /></h3>
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
                                            <h3>Call Insights</h3>
                                        </div>
                                        <div className="insights-body clearfix">
                                            <div className="row">
                                                <div className="col-lg-3">
                                                    <div className="insights-box">
                                                        <div className="insights-box-header clearfix">
                                                            <h4>CX Score</h4>
                                                            <img src="/assets/images/cx-icon.png" className="img-responsive" alt="" />
                                                        </div>
                                                        <div className="insights-box-count">
                                                            <h2>{deepAnalysis && deepAnalysis.cx_score}%</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3">
                                                    <div className="insights-box">
                                                        <div className="insights-box-header clearfix">
                                                            <h4>Customer <br /> Sentiment</h4>
                                                            <img src="/assets/images/customer-icon.png" className="img-responsive" alt="" />
                                                        </div>
                                                        <div className="insights-box-count">
                                                            <h2>{deepAnalysis && deepAnalysis.customer_sentiment.toFixed(2)}</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3">
                                                    <div className="insights-box">
                                                        <div className="insights-box-header clearfix">
                                                            <h4>Tonal <br /> Agreeability</h4>
                                                            <img src="/assets/images/agreeability-icon.png" className="img-responsive" alt="" />
                                                        </div>
                                                        <div className="insights-box-count">
                                                            <h2>{deepAnalysis.tone_result['agreeableness']}%</h2>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-3">
                                                    <div className="insights-box">
                                                        <div className="insights-box-header clearfix">
                                                            <h4>Resolution</h4>
                                                            <img src="/assets/images/resolution-icon.png" className="img-responsive" alt="" />
                                                        </div>
                                                        <div className="insights-box-count">
                                                            <h2>
                                                                {deepAnalysis.resolution && <i className="fa fa-check-circle" aria-hidden="true"></i>}
                                                                {!deepAnalysis.resolution && <i className="fa fa-times-circle" aria-hidden="true"></i>}
                                                            </h2>
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
                                                    <h3>Call Duration : {deepAnalysis.duration}</h3>
                                                </div>
                                            </div>
                                            <div className="col-md-6" style={{ padding: "10px", paddingRight: "20px" }}>
                                                <input className="pull-right btn btn-info" type="submit" onClick={play} value={isPlaying ? "Pause" : "Play"} />
                                            </div>
                                        </div>

                                        <div className="row" style={{ height: "220px", paddingLeft: "20px", paddingRight: "20px" }} onMouseMove={(e) => handleMouseOver(e)}>
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

                                        <div className="row" style={{ paddingBottom: "10px" }}>
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

                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="white-box-global">
                                        <div className="white-box-header">
                                            <h3>Customer Engagement: <span>{Math.round(customer_engagement)}%</span></h3>
                                        </div>
                                        <div className="engagement-body">
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <div className="engagement-box">
                                                        <h4>Opening</h4>
                                                        <div className="engagement-col">
                                                            <div className="engagement-item clearfix">
                                                                <div className="engagement-title">
                                                                    <p>Greeting</p>
                                                                </div>

                                                                {deepAnalysis.experience['greeting'] && (<div className="engagement-count"><p><i className="fa fa-check-circle" aria-hidden="true"></i></p></div>)}
                                                                {!deepAnalysis.experience['greeting'] && (<div className="engagement-count no-data"><p><i className="fa fa-times-circle" aria-hidden="true"></i></p></div>)}

                                                            </div>
                                                            <div className="engagement-item clearfix">
                                                                <div className="engagement-title">
                                                                    <p>Introduction</p>
                                                                </div>
                                                                {deepAnalysis.experience['introduction'] && (<div className="engagement-count"><p><i className="fa fa-check-circle" aria-hidden="true"></i></p></div>)}
                                                                {!deepAnalysis.experience['introduction'] && (<div className="engagement-count no-data"><p><i className="fa fa-times-circle" aria-hidden="true"></i></p></div>)}
                                                            </div>
                                                            <div className="engagement-item clearfix">
                                                                <div className="engagement-title">
                                                                    <p>Asking for Problem</p>
                                                                </div>
                                                                {deepAnalysis.experience['problem_statement'] && (<div className="engagement-count"><p><i className="fa fa-check-circle" aria-hidden="true"></i></p></div>)}
                                                                {!deepAnalysis.experience['problem_statement'] && (<div className="engagement-count no-data"><p><i className="fa fa-times-circle" aria-hidden="true"></i></p></div>)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="engagement-box">
                                                        <h4>Closing</h4>
                                                        <div className="engagement-col">
                                                            <div className="engagement-item clearfix">
                                                                <div className="engagement-title">
                                                                    <p>Call Ending Question</p>
                                                                </div>
                                                                {deepAnalysis.experience['closing_question'] && (<div className="engagement-count"><p><i className="fa fa-check-circle" aria-hidden="true"></i></p></div>)}
                                                                {!deepAnalysis.experience['closing_question'] && (<div className="engagement-count no-data"><p><i className="fa fa-times-circle" aria-hidden="true"></i></p></div>)}
                                                            </div>
                                                            <div className="engagement-item clearfix">
                                                                <div className="engagement-title">
                                                                    <p>Call Ending Statement</p>
                                                                </div>
                                                                {deepAnalysis.experience['closing_text'] && (<div className="engagement-count"><p><i className="fa fa-check-circle" aria-hidden="true"></i></p></div>)}
                                                                {!deepAnalysis.experience['closing_text'] && (<div className="engagement-count no-data"><p><i className="fa fa-times-circle" aria-hidden="true"></i></p></div>)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="wrapper-two-half">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="white-box-global">
                                                    <div className="white-box-header">
                                                        <h3>Consumable Insights</h3>
                                                    </div>
                                                    <div className="two-half-body">
                                                        <div className="scroll-element">

                                                            {
                                                                consumables_insight_array.map((ciItem) => (
                                                                    <div className="two-half-body-wrapper">
                                                                        <h4>{ciItem.startTime}-{ciItem.endTime}</h4>
                                                                        <div className="summery-info">
                                                                            <div className="summery-info-item clearfix">
                                                                                <table>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td>Keyword</td>
                                                                                            <td>{ciItem.keyword}</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>Consumable <br /> Insight</td>
                                                                                            <td>{ciItem.recommendation}</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }



                                                        </div>
                                                        {/* <a href="##" className="bottom-arrow"><img src="/assets/images/arrow-circle-bottom.png" /></a> */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="white-box-global" >
                                                    <div className="white-box-header"><h3 >Product Manager Review</h3></div>
                                                    <div className="global-body">
                                                        <div className="review-form">
                                                            <div className="textarea-box">
                                                                <textarea placeholder="Write Review Here" onChange={(e) => setMainReview(e.target.value)} value={mainReview}></textarea>
                                                            </div>
                                                            <div className="review-button">
                                                                <input type="submit" name="" value="Save" onClick={AddMainReview} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-9">
                                    <div className="white-box-global">
                                        <div className="white-box-header white-box-header-conversation clearfix">
                                            <div className="row">
                                                <div className="col-lg-3">
                                                    <h3>Conversations</h3>
                                                </div>
                                                <div className="col-lg-9">
                                                    <div className="conversation-right-panel">
                                                        <div className="conversation-search">
                                                            <label>Language:</label>
                                                            <select className="language" onChange={changeLanguage}>
                                                                {
                                                                    !isLanguageEnglish &&
                                                                    <option>{deepAnalysis.language}</option>
                                                                }
                                                                <option>English</option>
                                                            </select>
                                                            <label> Filter:</label>
                                                            <select className="filter" onChange={(e) => speechEmotionFilter(e.target.value)}>
                                                                {
                                                                    emotions &&
                                                                    emotions.map(emotion => (
                                                                        <option value={emotion}>{emotion}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                            <select className="time-interval" onChange={(e) => speechTimeFilter(e.target.value)}>
                                                                {
                                                                    deepAnalysis &&
                                                                    deepAnalysis.deep_analysis_data.map(item => (
                                                                        <option value={item.startTime}>{item.startTime} - {item.endTime}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="conversation-body">
                                            <div className="conversation-body-scroll">
                                                {
                                                    !showSpecTranscription &&
                                                    deepAnalysis.deep_analysis_data.map((item) => (

                                                        <div className="conversation-column clearfix">
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <div className="conversation-header-left">
                                                                        <div className="conversation-count">{item.startTime} - {item.endTime}</div>
                                                                        <div className="conversation-title"><span>{item.speaker}</span></div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="conversation-header-right">
                                                                        <a onClick={() => fetchReviewData(item.startTime, item.endTime)} className="icon-button"><b>{item.review.length > 0 ? item.review.length : ''}</b>&nbsp;<img src="/assets/images/note-edit.png" className="img-responsive" alt="" /></a>
                                                                        <a onClick={() => handleSubAudio(item.audio)} className="text-button">Play</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-12">
                                                                    <div className="call-records-info">
                                                                        <p>{displayEnglish ? item.dialogue : item.early_dialogue}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row">

                                                                <div className="col-md-12">
                                                                    <div className="call-records-info-half clearfix">
                                                                        <div className="call-records-info-half-wrapper clearfix">
                                                                            <div className="call-records-info-half-wrapper-box">
                                                                                <div className="icon-half"><img src="/assets/images/img1.png" className="img-responsive" alt="" /></div>
                                                                                <div className="icon-ionfo"><h5><span>Energy</span><br />{item.energy}</h5></div>
                                                                            </div>
                                                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                                                <div className="icon-half" style={{ fontSize: "35px" }}>
                                                                                    {
                                                                                        item.emotion === 'Happy' &&
                                                                                        <BiHappyAlt />
                                                                                    }
                                                                                    {
                                                                                        item.emotion === 'Sad' &&
                                                                                        <FaRegSadTear />
                                                                                    }
                                                                                    {
                                                                                        item.emotion === 'Calm' &&
                                                                                        <BsEmojiNeutral />
                                                                                    }
                                                                                    {
                                                                                        item.emotion === 'Angry' &&
                                                                                        <BsEmojiAngry />
                                                                                    }
                                                                                    {
                                                                                        item.emotion === 'Fearful' &&
                                                                                        <BsEmojiDizzy />
                                                                                    }
                                                                                </div>
                                                                                <div className="icon-ionfo"><h5><span>Emotion</span><br />{item.emotion}</h5></div>
                                                                            </div>
                                                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                                                <div className="icon-half"><img src="/assets/images/img3.png" className="img-responsive" alt="" /></div>
                                                                                <div className="icon-ionfo"><h5><span>Entropy</span><br />{item.entropy}</h5></div>
                                                                            </div>
                                                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                                                <div className="icon-half"><img src="/assets/images/img4.png" className="img-responsive" alt="" /></div>
                                                                                <div className="icon-ionfo"><h5><span>Loudness</span><br />{item.loudness}</h5></div>
                                                                            </div>
                                                                            <div className="call-records-info-half-wrapper-box clearfix">
                                                                                <div className="icon-half"><img src="/assets/images/img5.png" className="img-responsive" alt="" /></div>
                                                                                <div className="icon-ionfo"><h5><span>Sentiment</span><br />{item.sentiment}</h5></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>

                                                    ))

                                                }

                                                {
                                                    showSpecTranscription &&
                                                    <div id="deepAnalysisTranscriptionDiv">

                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="white-box-global" >
                                        <div className="white-box-header"><h3>Action Taken</h3></div>
                                        <div className="global-body">
                                            <div className="action-taken">
                                                <div className="engagement-item clearfix">
                                                    <div className="engagement-title">
                                                        <p>Opportunity</p>
                                                    </div>
                                                    <div className="engagement-count">
                                                        <p>{deepAnalysis && deepAnalysis.lead_count}</p>
                                                    </div>
                                                </div>
                                                <div className="engagement-item clearfix">
                                                    <div className="engagement-title">
                                                        <p>Service Request</p>
                                                    </div>
                                                    <div className="engagement-count">
                                                        <p>{deepAnalysis && deepAnalysis.sr_count}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="white-box-global">
                                        <div className="white-box-header">
                                            <h3>Comments</h3>
                                        </div>
                                        <div className="two-half-body">
                                            <div className="scroll-element">

                                                {
                                                    deepAnalysis.review.map((item) => (
                                                        <div className="two-half-body-wrapper">
                                                            <h4>{item.start_time != -1 && (item.start_time - item.end_time)} &nbsp;|| <label>{item.comment_by}</label></h4>
                                                            <div className="summery-info">
                                                                <div className="summery-info-item clearfix">
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>Date</td>
                                                                                <td>{item.date}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Comment</td>
                                                                                <td>{item.comment}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    ))
                                                }

                                            </div>
                                            {/* <a href="##" className="bottom-arrow"><img src="/assets/images/arrow-circle-bottom.png" /></a> */}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>)}
                    </div>
                </div>
            </section>



            {showModal &&
                (<div className="modal show">
                    <div className="backdrop"></div>
                    <div className="modal-dialog" role="document" style={{ zIndex: 6 }}>
                        <div className="my-calls-popup-details">
                            <h2>Call Review</h2>

                            <div style={{ maxHeight: "500px", overflow: "auto" }}>
                                {
                                    reviewData &&
                                    reviewData.map((data) => (
                                        <div className="alert alert-info" role="alert">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <i className="fa fa-comment"></i> &nbsp;
                                                <label>{data.comment}</label>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <i className="fa fa-user"></i>&nbsp;
                                                {data.commented_by__first_name}&nbsp;{data.commented_by__last_name}
                                                </div>
                                                <div className="col-md-6">
                                                    <i className="fa fa-calendar"></i> &nbsp;
                                                {data.date__date}
                                                </div>
                                            </div>
                                        </div>
                                    ))

                                }
                            </div>


                            {reviewDataLoading &&
                                <div className="alert alert-info" role="alert">
                                    <div className="empty-call" style={{ height: "500px" }}>
                                        <ClipLoader color="#2056FF" size="50px" />
                                    </div>
                                </div>
                            }


                            {reviewDataLoadingError &&
                                <div className="alert alert-info" role="alert">
                                    <div className="empty-call" style={{ height: "500px" }}>
                                        <p style={{ fontSize: "25px", color: "#FF8520" }}>
                                            {
                                                reviewDataLoadingError === 'Connection Error' &&
                                                <RiSignalWifiErrorFill />
                                            }
                                            {
                                                reviewDataLoadingError !== 'Connection Error' &&
                                                <BiError />
                                            }
                                            {reviewDataLoadingError}
                                        </p>
                                    </div>
                                </div>
                            }

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-col clearfix">
                                        <input type="text" placeholder="Add a review here" value={newReview} onChange={(e) => setNewReview(e.target.value)} />
                                    </div>
                                </div>
                            </div>



                            {
                                !postPending &&
                                <div className="popup-footer">
                                    <button onClick={toggleModal} className="btn" data-dismiss="modal" type="button"> Close  </button>
                                    <button onClick={() => addNewReview(selectedStartTime, selectedEndTime)} className="btn Save" data-dismiss="modal" type="button"> Post  </button>
                                </div>

                            }

                            {
                                postPending &&
                                <div className="popup-footer">
                                    <button className="btn" data-dismiss="modal" type="button"> Posting...  </button>
                                </div>

                            }

                            {
                                postError &&
                                <p className="errorColor">{postError}</p>
                            }

                        </div>

                    </div>
                </div>)}



            <Footer />
        </div>
    );
}

export default DeepAnalysis;