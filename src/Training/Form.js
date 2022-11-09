import { color } from "highcharts";
import { max } from "moment-timezone";
import React, {useEffect}  from "react";
import { useState } from "react";
import '../Form.css'
// import '../App.css'
import { Editor } from "react-draft-wysiwyg";
import "./FormEditor.css"
import { Redirect, useHistory } from "react-router-dom";
import Service from "../webservice/http";
import { Link } from "react-router-dom";
import Multiselect from 'multiselect-react-dropdown';
import DatePicker from "react-datepicker";

import TimeDropDown from './TimePicker'
import Header from "../header/header";
import Footer from "../footer/footer";
import NavBar from "../nav/nav-bar";


const Form=()=> {
  const[Topic,setTopic]=useState('')
const[TrainigID,setTrainingID]=useState('')
const[DateFrom,setDateFrom]=useState('')
  const[DateTo,setDateTo]=useState('')
  const[TimeFrom,setTimeFrom]=useState('')
  const[TimeTo,setTimeTo]=useState('')
  const [userOptions, setUserOptions] = useState();
  const [assignTo, setAssignTo] = useState([]);
  const [detail, setDetail] = useState('');
  
  const[Attendees,setAttendees]=useState('')
  const[Language,setLanguage]=useState('')
  const[Mode,setMode]=useState('')
  const[Training,setTraining]=useState('')
  const[Location,setLocation]=useState('')
  const [errorText, setErrorText] = useState('');
  // const [startDate, setStartDate] = useState(new Date());

  const [relation, setRelation] = useState('');
  const [referenceID, setReferenceID] = useState('');
  const history = useHistory();

  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => { setShowModal(!showModal) }

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);
  

  const data=[
    
     { Attendees:" Mendatory ",id:1  },
     { Attendees:" Optional ",id:1  },
     { Attendees:" Host ",id:1  }
    
  ]
  const[options]=useState(data);

  const services = new Service();

  /**
   * Fetch contact list
   */
  function fetchData() {
      services.get('/api/customer/contact/').then(res => {
          console.log(res);
          setIsPending(false);
          if (res == 'TypeError: Failed to fetch') {
              setError('Connection Error')
          }
          else {
              try {
                  if (res.code == 'token_not_valid') {
                      localStorage.clear();
                      history.push("/login");
                  }
                  // setContactList(res);
                  setError(null);
              }
              catch (e) {
                  setError(e);
              }

          }
      })
  }


  const clickHandler = () => {
    setErrorText('');
    if (Topic === '' || TrainigID === '' || Attendees === '' || Language === '' || Mode === '' || Training===''|| Location==='') {
        setErrorText('All inputs are mendatory');
        return;
    }
    if (referenceID !== '') {
        if (relation === '') {
            setErrorText('Please Mention relation');
            return;
        }
    }

    setShowConfirmation(true);

}

  useEffect(() => {
    clickHandler()

  }, [])
  
 
 const [description, setDescription] = useState(null);
 useEffect(()=>{
  console.log(description)
 },[description]);

 const onSelectName = (selectedList, selectedItem) => {
  setAssignTo(selectedList);
}

const onRemoveName = (selectedList, removedItem) => {
  setAssignTo(selectedList);
  console.log(detail);
}
const [startDate, setStartDate] = useState(new Date());
const [endDate, setEndDate] = useState(new Date());


  return (
    <div className="mainpage ">
      <Header/>
      <NavBar/>
      <div className="m-header">
        <div className="meeting-icon">
          <div className="m-icon">
          <svg xmlns="http://www.w3.org/2000/svg" 
           width="20" 
           height="30"
           fill="currentColor"
           class="bi bi-plus-square-fill" 
           viewBox="0 0 16 16"
           className="svg-icon">
       <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0z"/>
       </svg>
          </div>

          <div>   
          <h1>New Training </h1>
          </div>
          </div>
          <div className="h-btn">
          <button  type='submit' onClick={clickHandler} className="btn-save">Save</button>
          <Link to="/Training/Schedulerteams"><button  className="btn-close">Close</button></Link>
          </div>
          </div>
     
      <div className="mainpage-input">
          <input
          className="input-feild "
          type="text"
          placeholder="Training ID"
          value={Training} onChange={(e)=>{setTrainingID(e.event.traget)}}
           />
         </div>

         <div className="mainpage-input">
          <input className="input-feild" type="text" placeholder="Topic" value={Topic} onChange={(e)=>{setTopic(e.target.value)}}/>
         </div>

      {/* <div className="mainpage-input">
       <div className="datetime-input">   
      <input className="date-time"  type="date" value={DateFrom} onChange={(e)=>setDateFrom(e.target.value)}/>
      <input className="date-time" type="time" value={TimeFrom} onChange={(e)=>setTimeFrom(e.target.value)}/>
       <img className="arrow-image" src=" https://www.freeiconspng.com/thumbs/arrow-icon/arrow-icon-28.png" alt="" />
      <input className="date-time" type="date" value={DateTo} onChange={(e)=>setDateTo(e.target.value)}/>
      <input className="date-time"  type="time" value={TimeTo} onChange={(e)=>setTimeTo(e.target.value)}/>
      </div>
      </div> */}

    <div className="mainpage-input " >
       <div className="datetime-input datepicker"> 
       <DatePicker selected={startDate} 
        onChange={(date) => setStartDate(date)}
         dateFormat="dd/MM/yyyy" 
         className="date-time"
         />   
          <DatePicker
          className="date-time"
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="h:mm aa"
    />

           <DatePicker
           className="date-time"
        selected={endDate}
        dateFormat="dd/MM/yyyy" 
        onChange={(date) => setEndDate(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
      />      
       <DatePicker
       className="date-time"
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="h:mm aa"
    />                                         
       </div>
       </div>
      
      <div className="mainpage-input">
      <div className="input-field attendees"> 
          <Multiselect options={options}   displayValue="Attendees" placeholder="Attendees" 
       style={{
      
        searchBox: {
          border: 'none',
          'border-bottom': 'none',
          'border-radius': '0px'
        },
        inputField:{
          padding:' 0px'
        }
      }}
          /> 
         </div>
         </div>
        
      
      <div className="mainpage-input">
        <select  className="input-feild attendees" onChange={(e)=>{setMode(e.target.value)}}>
        <option value="" disabled selected hidden>Mode</option>
                                                    <option value="Mandatory">ON</option>
                                                    <option value="optional">OFF</option>
                                                    
                                                </select>
      </div>

      <div className="mainpage-input">
        <select  className="input-feild attendees" onChange={(e)=>{setTraining(e.target.value)}}>
        <option value="" disabled selected hidden>Training</option>
                                                    <option value="Mandatory"></option>
                                                    <option value="optional"></option>
                                                    <option value="Host"></option>
                                                </select>
      </div>

      <div className="mainpage-input">
        <select  className="input-feild attendees" onChange={(e)=>{setLocation(e.target.value)}}>
        <option value="" disabled selected hidden>Location</option>
                                                    <option value="Mandatory"></option>
                                                    <option value="optional"></option>
                                                    <option value="Host"></option>
                                                </select>
      </div>
     

     <div className="mainpage-input">
        <input type="file" className="input-feild attendees "   />
      </div>
     
      <div className="mainpage-input ">
       <div className="input-feild user editor">
        <Editor className="text-area"
         toolbarClassName="toolbarClassName"
         wrapperClassName="wrapperClassName"
         editorClassName="editorClassName"
         editorStyle={{background:"white" }}
         onEditorStateChange={(e)=>setDescription(e.target.value)}
      />

       </div>
      
      </div>
  <Footer/>
    </div>
  );
}
export default Form