import React, { useState } from 'react'
import Header from '../header/header';
import Footer from '../footer/footer';
import NavBar from '../nav/nav-bar';
import '../App.css'
import { setDate } from 'rsuite/esm/utils/dateUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom';
import Calender from './Calendar'
import { useHistory } from "react-router-dom";
import Calendar from './Calendar';

const Schedulerteams = () => {
  const[ID,setID]=useState('')
const[training,setTraining]=useState('')
const [option,setOption]=useState('')
const[ date,setDate]=useState('')
const[attendees,setAttendees]=useState('')
const[attachment,setAttachment]=useState('')
const[location,setLocation]=useState('')
const[mode,setMode]=useState('')
const[salutationInput,setSalutation]=useState('')


const [showModal, setShowModal] = useState(false);
const toggleModal = () => { setShowModal(!showModal) }   

const history = useHistory();

const handlesubmit=(e)=>{
    e.preventDefault();
}


  return (

    <div className="dashboard-body">
        <Header />
        <NavBar />
        {/* <NotificationContainer /> */}

        <div className="container-fluid">
            <div className="my-call">

                <div className="my-calls-column">
                    <div className="calls-top-pannel">
                        <div className="row">
                          
                            <div className="col-lg-6">
                                
                                
                            </div>
                            <div className="col-lg-6">
                                <div className="pannel-nav clearfix">
                                    <ul className="">
                                    <li   onClick={() => { history.push('/Training/Form'); }}><a  className='button'><i class="fa fa-plus" aria-hidden="true"></i> New Training</a></li>
                                        <li onClick={()=>toggleModal(true)}><a className='button2'><i class="fa-solid fa-video" aria-hidden="true"></i> Training Now</a></li>
                                    </ul>
                                </div>
                                <div className="clear">
                                  
                                </div>
                            </div>
                        </div>
                        <div className="row">
                       
                      </div>
                        
                    </div>
                </div>
        <div>
        <Calender/>  
        </div>
            </div>
        </div>
        <Footer />
        
    </div>
  
);
}

export default Schedulerteams