import { useHistory } from "react-router-dom";
import Service from './../webservice/http';
import { useEffect, useState, useRef } from "react";
import { ImCross } from 'react-icons/im';
import { IoMdSend } from 'react-icons/io';
import { BiUserCircle } from 'react-icons/bi';


const ChatBox = (props) => {
    const history = useHistory();
    const services = new Service();

    const messagesEndRef = useRef(null);


    // const [showChatBox, setShowChatBox] = useState(false);
    const changeChatBoxDisplay = () => {
        props.setShowChatBox(false);
    }


    /**
     * Post new chat message to chat websocket 
     */
    const handleMessageSubmit = (e) => {
        e.preventDefault();
        if (newUserMessage === '') {
            return;
        }

        props.setSendMsgData({ "message": newUserMessage, "sent_to": props.selectedUser.id })
        // props.handleClickSendMessage();

        // setMessages(prevMessage => [...prevMessage, {
        //     date: "",
        //     time: "",
        //     username: localStorage.getItem('username'),
        //     _id: "",
        //     _message: newUserMessage,
        //     _seen: false
        // }]);
        setNewUserMessage('');
    }
    const [newUserMessage, setNewUserMessage] = useState('');



    const [messages, setMessages] = useState(null);

    /**
     * Fetch user chat messages from chat API
     * @param {*} page Page Number for pagination
     */
    function fetchMessages(page) {
        services.get(`api/chat/chat_messages/${props.selectedUser.id}/${page}/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setMessages(res);
                for (let i = 0; i < props.messageData.length; i++) {
                    if (props.messageData[i].username === props.selectedUser.id) {
                        props.messageData[i].messages = res;
                    }
                }
            }
        })
    }

    /**
     * Change display messages on chat box on changing user selection
     */

    useEffect(() => {
        console.log(props.messageData)
        props.messageData.map(userMsgData => {
            if (userMsgData.username === props.selectedUser.id) {
                if (userMsgData.messages.length == 0) {
                    console.log("--------")
                    fetchMessages(0);
                }
                else {
                    setMessages(userMsgData.messages);
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

                }
            }
        })
    }, [props.selectedUser])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        console.log("changed message data")
    })




    const changeMessageTextValue = (e) => {
        setNewUserMessage(e.target.value);
        props.setSendMsgData({ "typing": true, "sent_to": props.selectedUser.id });
    }


    return (
        <div className="chat-box">
            <div className="chat-box-header">
                <div className="col-sm-1">
                    {/* <img style={{ height: "45px", width: "40px", borderRadius: "50%", backgroundColor: "white" }} src="/assets/images/assistant-image-head.png" /> */}
                    {
                        props.selectedUser.image === '/media/' &&
                        <BiUserCircle size="42" color="#959595" />
                    }
                    {
                        props.selectedUser.image !== '/media/' &&
                        <img src={services.domain + props.selectedUser.image} style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            marginBottom: "10px"
                        }} />
                    }
                </div>
                <div className="col-sm-8" >
                    <h5 style={{ paddingLeft: "6px" }}>{props.selectedUser.username}</h5>
                    {
                        props.typing ?
                            <a style={{ paddingLeft: "6px", color: "white" }}>Typing...</a> :
                            <a style={{ paddingLeft: "6px", color: "white" }}>Online</a>
                    }

                </div>
                <div className="col-sm-2 pull-right">
                    <span className="chat-box-toggle"><ImCross onClick={changeChatBoxDisplay} /></span>
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
                                    messageItem.username === props.selectedUser.id &&
                                    <div id='cm-msg' className="chat-msg">
                                        <div className="cm-msg-text">
                                            {messageItem._message}
                                        </div>
                                    </div>
                                }
                                {
                                    messageItem.username !== props.selectedUser.id &&
                                    <div id='cm-msg' className="chat-msg self">
                                        <div className="cm-msg-text">
                                            {messageItem._message}
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
                    <input type="text" id="chat-input" placeholder="Send a message..." autoComplete="off" value={newUserMessage} onChange={changeMessageTextValue} />
                    <button type="submit" className="chat-submit" id="chat-submit">
                        <IoMdSend size="30" color="#1940b7" onClick={handleMessageSubmit} />
                    </button>
                </form>
            </div>
        </div>

    );
}

export default ChatBox;