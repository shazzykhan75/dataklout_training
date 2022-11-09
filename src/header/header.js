import { useHistory } from "react-router-dom";
import Service from './../webservice/http';
// import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChatButton from '../chat-bot/chat-button';
import { BsChatLeftText, BsQuestionCircle } from 'react-icons/bs';
// import ReactTimeAgo from 'react-time-ago'
// import TimeAgo from 'javascript-time-ago'
// import en from 'javascript-time-ago/locale/en.json';

import ChatList from "./../chat/chat-list";
import ChatBox from "./../chat/chat-box";

import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const Header = () => {
    // TimeAgo.addDefaultLocale(en)
    // TimeAgo.addLocale(ru)

    const history = useHistory();
    const services = new Service();


    /**
     * Logout Method
     * All local Storage will be cleared and call logout api to blacklist the token
     */
    const logout = () => {
        services.get('/api/access_control/logout/').then(res => {
            console.log(res);
        })
        localStorage.clear();
        window.location.reload();
        //browser.tabs.reload();
    };

    const [chatHeaders, setChatHeaders] = useState(null);


    /**
     * Fetch self profile details
     * Store all info in localstorage
     */
    function fetchProfileData() {
        services.get('api/access_control/self_details/').then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {

            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    localStorage.setItem('client_name', res['client']);
                    localStorage.setItem('first_name', res['first_name']);
                    localStorage.setItem('image', res['image']);
                    localStorage.setItem('last_name', res['last_name']);
                    localStorage.setItem('role', res['role']);
                }
                catch (e) {

                }
            }
        })
    }

    useEffect(() => {
        fetchProfileData();
        // fetchChatHeadres();
    }, [])


    /**
     * Reload the page when there is any change in Localstoage
     * It is useful when application is logged out from one window another tab is opened
     */
    useEffect(() => {
        window.addEventListener('storage', () => {
            window.location.reload();
        })


    }, []);

    const [showChatBox, setShowChatBox] = useState(false);
    const [selectedUser, setSelectedUser] = useState({ "username": "", "id": "", "image": "" })


    const [messageData, setMessageData] = useState(null);


    // ______________________________________________________________________________________________________________________________


    const [socketUrl, setSocketUrl] = useState(`ws://152.67.26.213:8030/chat/?${localStorage.getItem('access_token')}`);
    const [messageHistory, setMessageHistory] = useState([]);

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    const [tempMessageData, setTempMessageData] = useState(null)
    const [typing, setTyping] = useState(false);



    /**
     * Track typing status in one to one chat
     */
    useEffect(() => {
        if (typing === true) {
            const timeId = setTimeout(() => {
                setTyping(false)
            }, 1000)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [typing]);


    /**
     * Handle new message stream send by peer
     */
    useEffect(() => {
        if (lastMessage !== null) {
            var receivedData = JSON.parse(lastMessage.data);
            var data = messageData;

            // console.log(receivedData);

            var i = 0;
            // var count = data.length;
            // for (let i = 0; i < data.length; i++) {
            if (receivedData.typing == true) {
                console.log(selectedUser.id)
                console.log(receivedData.sent_by)
                if (selectedUser.id == receivedData.sent_by) {
                    setTyping(true);
                }
            }
            else {
                messageData.map(() => {
                    if (data[i].username === receivedData.sent_by || data[i].username === receivedData.sent_to) {
                        data[i].last_message = receivedData.message;
                        data[i].last_message_by = receivedData.sent_by;
                        data[i].messages.push({
                            date: "",
                            time: "",
                            username: receivedData.sent_by,
                            _id: "",
                            _message: receivedData.message,
                            _seen: false
                        })
                    }
                    i++;
                })
                console.log(messageData)
                setTempMessageData(p => data)
            }
        }
    }, [lastMessage, messageData]);


    useEffect(() => {
        if (tempMessageData !== null) {
            setMessageData(p => tempMessageData);
            setTempMessageData(null);
        }
    }, [tempMessageData])

    const [sendMsgData, setSendMsgData] = useState({});
    const handleClickSendMessage = useCallback(() => {
        console.log(JSON.stringify(sendMsgData));
        sendMessage(JSON.stringify(sendMsgData));
    }, []);

    useEffect(() => {
        console.log(sendMsgData);
        sendMessage(JSON.stringify(sendMsgData));
    }, [sendMsgData])


    /**
     * React websocket status config
     */
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <div className="top-header-botttom clearfix">
            <ChatButton />

            {
                showChatBox &&
                <ChatBox
                    setShowChatBox={setShowChatBox}
                    selectedUser={selectedUser}
                    messageData={messageData}
                    setMessageData={setMessageData}
                    setSendMsgData={setSendMsgData}
                    handleClickSendMessage={handleClickSendMessage}
                    typing={typing}
                />
            }
            <div className="container-fluid">
                <div className="logo">
                    <a href="#"><img src="/assets/images/logo-icon-1.png" className="img-responsive" alt="" /></a>
                </div>
                <div className="top-header-botttom-right">
                    <div className="top-header-botttom-right-left">
                        <div className="search-bar">
                            <select>
                                <option value="0">All</option>
                            </select>
                            <div className="search-bar-box">
                                <input type="text" name="search" placeholder="Search..." />
                                <button type="submit"><i className="icon-Search"></i></button>
                            </div>
                        </div>
                        <div className="wrapper-option">

                            <div className="dropdown left">
                                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">  <i className="icon-Fav"></i>
                      Favourites</button>
                            </div>

                            <div className=" left last">
                                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"> <i className="icon-Action"></i>
                        Actions</button>
                            </div>


                        </div>
                    </div>
                    <div className="top-header-botttom-right-wrapper-right">
                        <ul>
                            <li className="dropdown left last">
                                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"> <BsQuestionCircle /> </button>
                            </li>
                            <li className="dropdown left last">
                                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"> <BsChatLeftText /> </button>
                                <ul className="dropdown-menu">
                                    <ChatList setShowChatBox={setShowChatBox} setSelectedUser={setSelectedUser} messageData={messageData} setMessageData={setMessageData} />

                                </ul>
                            </li>

                            <li className="dropdown left last">

                                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
                                    {
                                        localStorage.getItem('client_logo') != '/media/' &&
                                        <img src={services.domain + localStorage.getItem('client_logo')} style={{
                                            width: "60px",
                                            height: "40px",
                                            // borderRadius: "50%",
                                            marginBottom: "10px"
                                        }} />
                                    }

                                </button>


                            </li>

                            <li className="dropdown left last">

                                <button className="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">
                                    {
                                        localStorage.getItem('image') === '/media/' &&
                                        <i className="icon-user"></i>
                                    }
                                    {
                                        localStorage.getItem('image') != '/media/' &&
                                        <img src={services.domain + localStorage.getItem('image')} style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            marginBottom: "10px"
                                        }} />
                                    }

                                </button>

                                <ul className="dropdown-menu">
                                    <li><Link to="/account"><a>{localStorage.getItem('first_name')}&nbsp;{localStorage.getItem('last_name')}</a></Link></li>
                                    <li><a>{localStorage.getItem('client_name')}</a></li>
                                    <li><a onClick={logout}>Logout</a></li>
                                </ul>
                            </li>
                        </ul>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;