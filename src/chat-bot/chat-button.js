import { useState, useRef, useEffect } from 'react';
import './chat.css';
import { FiMinimize2 } from 'react-icons/fi';
import { GoPrimitiveDot } from 'react-icons/go';
import { IoMdSend } from 'react-icons/io';
import Service from './../webservice/http';
import { Redirect, useHistory } from "react-router-dom";


const ChatButton = () => {
    const history = useHistory();
    const services = new Service();
    const [showChatBox, setShowChatBox] = useState(false);
    const changeChatBoxDisplay = () => {
        setShowChatBox(!showChatBox);
    }

    const [newUserMessage, setNewUserMessage] = useState('');
    const [messages, setMessages] = useState([{
        'by': 'Newton',
        'message': 'Hi, I am Newton your Dataklout support assistant.'
    },
    {
        'by': 'Newton',
        'message': 'How May I assist you ?'
    }]);
    const messagesEndRef = useRef(null);

    /**
     * Receive user input from chatbot input box
     * @param {*} e  Event
     */
    const handleMessageSubmit = (e) => {
        e.preventDefault();
        if (newUserMessage === '') {
            return;
        }
        setMessages(prevMessage => [...prevMessage, { 'by': 'User', 'message': newUserMessage }]);
        fetchAnswer(newUserMessage);
    }

    const [error, setError] = useState(null);

    /**
     * Fetch chatbot query result from API
     * @param {*} message Input Message Text
     */
    function fetchAnswer(message) {
        var data = { "message": message }
        services.post('api/chatbot/', data).then(res => {
            console.log(res.message);
            if (res == 'TypeError: Failed to fetch') {
                setError('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setNewUserMessage('');
                setMessages(prevMessage => [...prevMessage, { 'by': 'Newton', 'message': res.message }]);
            }

        })
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    useEffect(() => {
        console.log('9999999')
        if (messages.length < 2) {

        }
    }, [])

    return (
        <div id="body">
            {
                !showChatBox &&
                <div id="chat-circle" className="btn btn-raised" onClick={changeChatBoxDisplay}>
                    <div id="chat-overlay"></div>
                    <img style={{ height: "80px", bottom: "52px", right: "13px", position: "fixed" }} src="/assets/images/assistant-image.png" />
                </div>
            }

            {
                showChatBox &&
                <div className="chat-box">
                    <div className="chat-box-header">
                        <div className="col-sm-2">
                            <img style={{ height: "45px", width: "40px", borderRadius: "50%", backgroundColor: "white" }} src="/assets/images/assistant-image-head.png" />
                        </div>
                        <div className="col-sm-8">
                            <p><GoPrimitiveDot color="green" size="30" style={{ paddingTop: "5px" }} />Newton</p>
                        </div>
                        <div class="col-sm-2">
                            <span className="chat-box-toggle"><FiMinimize2 onClick={changeChatBoxDisplay} /></span>
                        </div>
                    </div>
                    <div className="chat-box-body">
                        <div className="chat-box-overlay">
                        </div>
                        <div className="chat-logs">
                            {
                                messages &&
                                messages.map(messageItem => (
                                    <>
                                        {
                                            messageItem.by === 'Newton' &&
                                            <div id='cm-msg' className="chat-msg">
                                                <div className="cm-msg-text">
                                                    {messageItem.message}
                                                </div>
                                            </div>
                                        }
                                        {
                                            messageItem.by === 'User' &&
                                            <div id='cm-msg' className="chat-msg self">
                                                <div className="cm-msg-text">
                                                    {messageItem.message}
                                                </div>
                                            </div>
                                        }
                                    </>
                                ))
                            }
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <div className="chat-input">
                        <form onSubmit={handleMessageSubmit}>
                            <input type="text" id="chat-input" placeholder="Send a message..." autoComplete="off" value={newUserMessage} onChange={(e) => setNewUserMessage(e.target.value)} />
                            <button type="submit" className="chat-submit" id="chat-submit">
                                <IoMdSend size="30" color="#1940b7" onClick={handleMessageSubmit} />
                            </button>
                        </form>
                    </div>
                </div>
            }
        </div>
    );
}

export default ChatButton;