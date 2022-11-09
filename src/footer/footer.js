import { useState, useEffect } from "react";
import Service from './../webservice/http';
import Masonry from "react-masonry-css";
import './footer.css';

const Footer = () => {
    const [showNotesModel, setShowNotesModel] = useState(false);
    const toggleNotesModel = () => {
        setShowNotesModel(!showNotesModel);
    }

    const services = new Service();
    const [notesData, setNotesData] = useState();
    const [note, setNote] = useState('');
    const [subject, setSubject] = useState('');
    const [color, setColor] = useState('#ffffff');
    const [error, setError] = useState(null);
    const [isPending, setisPending] = useState(false);


    /**
     * Fetch Notes from manage note API 
     */
    async function fetchNotes() {
        setError(null);
        services.get('/api/notes/manage_notes/').then(res => {
            setisPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {
                setNotesData(res);
                setError(null);
            }
        })
    }

    /**
     * Initiate fetch notes on page load
     */
    useEffect(() => {
        fetchNotes();
    }, [])


    /**
     * Create a new note and post to Manage notes API
     */
    const addNewNote = () => {
        if (note !== '' & subject !== '') {
            var notesData = {
                "note": note,
                "subject": subject,
                "color": color
            }
            services.post('/api/notes/manage_notes/', notesData).then(res => {
                console.log(res);
                if (res == 'TypeError: Failed to fetch') {
                    setError('Failed to Fetch')
                }
                else {
                    setNote('');
                    fetchNotes();
                    setSubject('');
                }
            })
        }
    }


    /**
     * Perform delete note
     */
    const deleteNote = (e) => {
        var note_id = e.target.id;
        services.delete(`/api/notes/manage_notes/${note_id}/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {
                setNote('');
                fetchNotes();
            }
        })
    }


    /**
     *update note color and post to API 
     */
    const updateColor = (e) => {
        var note_id = e.target.id;
        var notesData = {
            "color": e.target.name
        }
        services.put(`/api/notes/manage_notes/${note_id}/`, notesData).then(res => {
            console.log(notesData);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {
                setNote('');
                fetchNotes();
            }
        })
    }

    return (
        <>
            <footer className="page-footer clearfix">
                <div className="container-fluid">
                    <div className="footer-box">
                        <a href="#"><i className="icon-phone"></i>Phone</a>
                        <a onClick={toggleNotesModel}><img src="assets/images/notes.png" className="img-responsive" alt="" />Notes</a>
                        <a href="#"><i className="icon-History"></i>History</a>
                    </div>
                </div>
            </footer>

            {
                showNotesModel && (
                    <div className="modal my-calls-popup show">
                        <div className="backdrop"></div>
                        <div className="modal-dialog" role="document">
                            <div className="my-calls-popup-details" style={{ background: "#ffffff" }}>
                                <div className="pull-right" style={{ cursor: "pointer" }} onClick={toggleNotesModel}>
                                    <i className="fa fa-times pull-right" aria-hidden="true"></i>
                                </div>

                                <h2><div className="icon-div"><div><i style={{ color: "white" }} className="fa fa-thumb-tack" aria-hidden="true"></i></div></div>General Notes</h2>

                                <div style={{ height: "600px" }}>
                                    <div style={{ height: "580px" }}>
                                        <div className="accordion" style={{ width: "99%" }}>
                                            <Masonry
                                                breakpointCols={4}
                                                className="my-masonry-grid"
                                                columnClassName="my-masonry-grid_column"
                                            >

                                                {
                                                    notesData &&
                                                    notesData.map(note => (
                                                        <div class="" style={{ paddingLeft: "5px", paddingTop: "5px", paddingRight: "5px" }}>
                                                            <div>
                                                                <div style={{ backgroundColor: note.color, borderStyle: "ridge", borderWidth: "2px" }}>
                                                                    <i style={{ paddingLeft: "5px", fontSize: "20px", color: "#1f4185", transform: "rotate(45deg)" }} className="fa fa-thumb-tack" aria-hidden="true"></i>
                                                                &nbsp;&nbsp;<label>{note.subject}</label>
                                                                    <i className="fa fa-trash pull-right" id={note.id} onClick={deleteNote} style={{ paddingTop: "5px", paddingRight: "5px", cursor: "pointer" }} aria-hidden="true"></i>

                                                                    <p style={{ paddingTop: "0px", paddingLeft: "10px", paddingRight: "10px", overflowWrap: "break-word", }}>{note.note}</p>
                                                                    <div class="row">
                                                                        <div class="col-md-6">
                                                                            <a style={{ color: "black", fontSize: "10px", paddingTop: "5px", paddingLeft: "10px", paddingBottom: "5px" }}><b>{note.date__date}</b>
                                                                            </a>

                                                                        </div>

                                                                        <div class="col-md-6">
                                                                            <div className="dropdown">
                                                                                <i className="fa fa-paint-brush pull-right dropdown-toggle" data-toggle="dropdown" style={{ paddingTop: "5px", paddingRight: "5px", cursor: "pointer" }} aria-hidden="true"></i>
                                                                                <div className="dropdown-menu" style={{ minWidth: "250px", left: 0 }}>
                                                                                    <div className="row">
                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#F3B936" style={{ backgroundColor: "#F3B936", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#FE9A59" style={{ backgroundColor: "#FE9A59", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#59FE9A" style={{ backgroundColor: "#59FE9A", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#E8B2D3" style={{ backgroundColor: "#E8B2D3", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#FF7189" style={{ backgroundColor: "#FF7189", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#BAA9F4" style={{ backgroundColor: "#BAA9F4", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                    </div>

                                                                                    <div className="row">
                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#86F5E6" style={{ backgroundColor: "#86F5E6", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#FFE646" style={{ backgroundColor: "#FFE646", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#CFFFAC" style={{ backgroundColor: "#CFFFAC", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#AFCCFB" style={{ backgroundColor: "#AFCCFB", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#D6D6CA" style={{ backgroundColor: "#D6D6CA", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderColor: "white", borderRadius: "50%" }}></button>
                                                                                        </div>

                                                                                        <div class="col-md-2" style={{ paddingRight: "0px", paddingLeft: "0px" }}>
                                                                                            <button onClick={updateColor} id={note.id} name="#fffff" style={{ backgroundColor: "#ffffff", fontSize: "8px", textAlign: "center", padding: "14px", margin: "4px 2px", borderRadius: "50%" }}></button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    ))
                                                }

                                            </Masonry>

                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: "50px" }}>
                                    <div>
                                        <div className="form-col clearfix" style={{ paddingLeft: "0px", paddingRight: "0px" }}>
                                            <div className="col-md-3">
                                                <input type="text" placeholder="Title..." value={subject} onChange={(e) => { setSubject(e.target.value) }} />
                                            </div>
                                            <div className="col-md-7">
                                                <input type="text" placeholder="Add New Notes..." value={note} onChange={(e) => { setNote(e.target.value) }} />
                                            </div>
                                            <div className="col-md-1">
                                                <input type="color" style={{ height: "45px" }} value={color} onChange={(e) => { setColor(e.target.value) }} />
                                            </div>
                                            <div className="col-md-1">
                                                <div className="sendButton" onClick={addNewNote}>
                                                    <i style={{ transform: "rotate(50deg)" }} className="fa fa-paper-plane" aria-hidden="true"></i>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }</>
    );
}

export default Footer;