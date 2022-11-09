import React, { useState } from 'react'
import Header from '../header/header';
import Footer from '../footer/footer';
import NavBar from '../nav/nav-bar';
import { setDate } from 'rsuite/esm/utils/dateUtils';
const Collection = () => {
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
                                <div className="pannel-heading clearfix">
                                    <div className="pannel-heading-info">
                                        <p></p>
                                        <h3></h3>
                                    </div>
                                </div>
                                <div className="bradcums">
                                    <ul className="clearfix">
                                        <li> <i className="fa fa-circle" aria-hidden="true"></i> {} Items</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="pannel-nav clearfix">
                                    <ul className="clearfix">
                                        <li onClick={()=>toggleModal(true)}><a>New </a></li>
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
                                    <p>Call Date</p>
                                </th>

                                <th>
                                    <p>Customer</p>
                                </th>


                                <th>
                                    <p>product</p>
                                </th>

                                <th>
                                    <p>Call Type</p>
                                </th>

                                <th>
                                    <p>Agent Recommendation</p>
                                </th>
                                <th>
                                  <p>Dataklout Recommendation</p>
                                </th>
                                <th>
                                  <p>Sentiments</p>
                                </th>
                                <th>
                                  <p>intent</p>
                                </th>
                              
                            </tr>
                        </thead>
                      
                       
                        
                    </table>


                </div>
            </div>
        </div>
        
        
        <Footer />

        {showModal &&(
        <form action="" onSubmit={handlesubmit} >
            <div className="modal my-calls-popup show">
                <div className="backdrop"></div>
                <div className="modal-dialog" role="document">
                    <div className="my-calls-popup-details">
                        <h2><div className="icon-div"><div><span><img src="assets/images/user-icon.png" className="img-responsive" alt="" /></span></div></div>Training Scheduler</h2>

                      
                            <div className="my-calls-form">
                                <div className="row">
                                    <div className="col-md-6">

                                    <div className="form-col clearfix">

                                              <label>Name </label><br />
                                               <input type="text" placeholder="Enter ID" value={ID} onChange={(e) => { setID(e.target.value) }} />
                                      </div>    


                                        <div className="form-col clearfix">

                                            <label>ID </label><br />
                                            <input type="text" placeholder="Enter ID" value={ID} onChange={(e) => { setID(e.target.value) }} />
                                        </div>
                                        <div className="form-col clearfix">
                                            <label>Topic  </label> &nbsp;<br></br>

                                            <input className="topic" type="text" placeholder="topic" value={option} onChange={(e) => { setOption(e.target.value) }} />
                                        </div>

                                        <div className="form-col clearfix ">
                                            <label>Date & Time</label><br />
                                            <input type="datetime-local" className="form-select  h-100 w-100 form-control " value={date} onChange={(e) => { setDate(e.target.value) }} />
                                        </div><br />
                                        <div className="form-col clearfix">
                                                <label>Attendees  </label> &nbsp;<div></div>
                                                <select  className="form-select  h-100 w-100" aria-label="" onChange={(e) => { setSalutation(e.target.value) }}>
                                                    <option value=""></option>
                                                    <option value="Mandatory">Mandatory</option>
                                                    <option value="optional">Optional</option>
                                                    <option value="Host">Host</option>
                                                </select>

                                            </div>


                                        
                                    </div>




                                    <div className="col-md-6">
                                      
                                       
                                    <div className="form-col clearfix">
                                            <label  htmlFor='file'>Attachment</label><br />
                                            <input type="file" placeholder="upload file" name='file' value={attachment} onChange={(e) => { setAttachment(e.target.value) }} />
                                        </div>
                                        <div className="form-col clearfix">
                                                <label>Location </label> &nbsp;<br />
                                                <select className="form-select  h-100 w-100" aria-label=""  onChange={(e) => { setSalutation(e.target.value) }}>
                                                    <option value=""></option>
                                                    <option value="bengaluru">Bengaluru</option>
                                                    <option value="chennai">Chennai</option>
                                                    <option value="hyderabad">Hyderabad</option>
                                                </select><br />


                                              
                                            </div>

                                            <div className="form-col clearfix">
                                                <label>Training</label> &nbsp;<br></br>
                                                <select className="form-select  h-100 w-100" aria-label=""  onChange={(e) => { setSalutation(e.target.value) }}>&nbsp;
                                                    <option value=""></option>
                                                    <option value="bengaluru">Frontend Training</option>
                                                    <option value="chennai">Backend Training</option>
                                                    <option value="hyderabad">Api Training</option>
                                                </select>


                                               
                                            </div>

                                            <div className="form-col clearfix">
                                                <label>Mode </label> &nbsp;<br></br>
                                                <select className="form-select  h-100 w-100" aria-label="" onChange={(e) => { setSalutation(e.target.value) }}>
                                                    <option value=""></option>
                                                    <option value="online">Online</option>
                                                    <option value="offline">Offline</option>
                                            
                                                </select>


                                              
                                            </div>

                                            
                                            <div className="form-col clearfix">
                                                <label>Language  </label> &nbsp;<div></div>
                                                <select  className="form-select  h-100 w-100" aria-label="" onChange={(e) => { setSalutation(e.target.value) }}>
                                                    <option value=""></option>
                                                    <option value="Mandatory">English</option>
                                                    <option value="optional">Hindi</option>
                                                    <option value="Host">Gujrati</option>
                                                    <option value="Host">Telgu</option>
                                                    <option value="Host">Kannada</option>
                                                    <option value="Host">Tamil</option>
                                                    <option value="Host">Marathi</option>
                                                    <option value="Host">Bengali</option>
                                                </select>


                                               
                                            </div>

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
                           <button type='submit'  onClick={toggleModal} className="btn" data-dismiss="modal" > Cancel  </button>
                           <button className="btn Save" type="submit" onClick={toggleModal} > Save  </button>
                          
                          
                        </div>
                    </div>
                </div>


            </div>
            </form>)}
    </div>
  
);
}

export default Collection