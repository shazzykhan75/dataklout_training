import { useHistory } from "react-router-dom";
import Service from './../webservice/http';
import { useEffect, useState, useRef } from "react";
import { BiUserCircle } from 'react-icons/bi';

// import ChatBox from 

const ChatList = (props) => {
    const history = useHistory();
    const services = new Service();


    const [chatHeaders, setChatHeaders] = useState(null);


    /**
     * Fetch chat headers based on hierarchy
     */
    function fetchChatHeadres() {
        services.get('api/chat/chat_contact_list/').then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log('Connection Error')
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setChatHeaders(res);

                var messageData = []
                try {
                    res.map(item => {
                        messageData.push({
                            first_name: item.first_name,
                            image: item.image,
                            last_name: item.last_name,
                            username: item.username,
                            unseen: item.message_details.unseen,
                            last_message: item.message_details.last_message,
                            last_message_time: item.message_details.date,
                            last_message_by: item.message_details.by,
                            messages: []
                        })
                    })
                    props.setMessageData(messageData)
                }
                catch { }
            }

        })
    }

    useEffect(() => {
        fetchChatHeadres();
    }, [])


    /**
     * change user selection on chat list
     * @param {*} first_name First Name
     * @param {*} last_name Last Name
     * @param {*} username Username
     * @param {*} image Image url string
     */
    function handleChatBoxDisplay(first_name, last_name, username, image) {
        props.setSelectedUser({ "username": first_name + " " + last_name, "id": username, "image": image })
        props.setShowChatBox(true);
    }


    return (
        <>
            <div className="row" style={{ padding: "5px", paddingRight: "20px" }}>
                {
                    props.messageData &&
                    props.messageData.map((cHeader) => (
                        <div className="row dataRow" style={{ width: "350px" }} onClick={() => handleChatBoxDisplay(cHeader.first_name, cHeader.last_name, cHeader.username, cHeader.image)} >
                            <div className="col-sm-2">
                                {
                                    cHeader.image === '/media/' &&
                                    <BiUserCircle size="42" color="#959595" />
                                }
                                {
                                    cHeader.image !== '/media/' &&


                                    <img src={services.domain + cHeader.image} style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        marginBottom: "10px"
                                    }} />
                                }
                            </div>
                            <div className="col-sm-10" >
                                <div className="row">
                                    <a style={{ fontSize: "15px" }}>{cHeader.first_name}&nbsp;{cHeader.last_name}</a>
                                    {
                                        cHeader.unseen > 0 &&
                                        <span className="step pull-right">{cHeader.unseen}</span>
                                    }
                                </div>
                                <div className="row">
                                    {
                                        cHeader.unseen > 0 &&
                                        <a style={{ fontSize: "12px" }}>{cHeader.last_message_by} &nbsp;:&nbsp;{cHeader.last_message}</a>
                                    }
                                    {
                                        cHeader.unseen == 0 &&
                                        <a style={{ fontSize: "12px", color: "#959595" }}>{cHeader.last_message}</a>
                                    }
                                    <div className="pull-right">
                                        <a style={{ fontSize: "12px", color: "#959595" }}>
                                            {cHeader.last_message_time}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    );
}

export default ChatList;