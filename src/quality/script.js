import { useEffect, useState } from 'react';
import Service from './../webservice/http';
import Modal from 'react-modal';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { AiFillCloseCircle } from 'react-icons/ai';
import { AiOutlinePlus } from 'react-icons/ai';
import { RiChatVoiceLine } from 'react-icons/ri';
// import styles from '.'../quality.module.css'


const ScriptSetup = () => {

    const services = new Service();
    const [scriptCategory, setScriptCategory] = useState('');

    /**
     * Fetch script category data
     */
    function fetchCategoryData() {
        setPhraseList(null);
        services.get(`/api/call_quality/phrase_category/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                try {
                    setScriptCategory(res);
                    if (res[0].name !== 'Full Script') {
                        setSelectedTopTab(res[0].name);
                        setSelectedCategoryId(res[0].id);
                    }
                    else {
                        setSelectedTopTab(res[1].name);
                        setSelectedCategoryId(res[1].id);
                    }
                } catch { }
            }
        })
    }

    useEffect(() => {
        fetchCategoryData();
        fetchFullScript();
    }, [])

    const [showNewModal, setShowNewModal] = useState(false);
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    }
    const [newCategoryTitle, setNewCategoryTitle] = useState('');


    /**
     * 
     * Create New script category
     */
    const createNewScriptCategory = () => {
        if (newCategoryTitle === '') {
            NotificationManager.error('error', 'Please Mention category title');
            return;
        }
        var data = {
            'name': newCategoryTitle
        }
        services.post(`/api/call_quality/phrase_category/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                if (res.message === 'success') {
                    NotificationManager.success('success', 'Created Category');
                    setShowNewModal(false);
                    setNewCategoryTitle('');
                    fetchCategoryData();
                }
            }
        })
    }

    const [selectedTopTab, setSelectedTopTab] = useState('');
    const [selectedCategoryID, setSelectedCategoryId] = useState(null);

    useEffect(() => {
        if (selectedCategoryID != null)
            fetchPhrases();

        setPhraseList(null);
    }, [selectedCategoryID])

    const [phraseList, setPhraseList] = useState(null);

    /**
     * Phase Phrases list based on sach script category
     */
    function fetchPhrases() {
        services.get(`/api/call_quality/phrase_category/${selectedCategoryID}/phrases/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setPhraseList(res);
            }
        })
    }

    function changeCategory(name, id) {
        setSelectedTopTab(name);
        setSelectedCategoryId(id);
    }

    const [showDeleteModal, setShowDeleteModal] = useState(false);


    /**
     * Delete script category
     */
    const deleteCategory = () => {
        services.delete(`/api/call_quality/phrase_category/${selectedCategoryID}/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setShowDeleteModal(false);
                NotificationManager.success('success', 'Category Deleted');
                fetchCategoryData();
            }
        })
    }

    const [showPhraseAddModal, setShowPhraseAddModal] = useState(false);
    const [newPhrase, setNewPhrase] = useState('');


    /**
     * Insert new phrase
     * 
     */
    const createNewPhrase = () => {
        if (newPhrase === '') {
            NotificationManager.error('error', 'Pleaseadd some phrase');
            return;
        }
        var data = {
            'phrase': newPhrase
        }
        services.post(`/api/call_quality/phrase_category/${selectedCategoryID}/phrases/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                if (res.message === 'success') {
                    NotificationManager.success('success', 'Added New Phrase');
                    setShowPhraseAddModal(false);
                    setNewPhrase('');
                    fetchPhrases();
                }
            }
        })
    }

    const [fullScript, setFullScript] = useState('');
    const [showFullScriptModel, setShowFullScriptModel] = useState(false);


    function fetchFullScript() {
        services.get(`/api/call_quality/manage_full_script/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setFullScript(res['FullScript']);
            }
        })
    }

    const updateFullScript = () => {
        var data = {
            "script": fullScript
        }
        services.post(`/api/call_quality/manage_full_script/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {

                NotificationManager.success('success', 'Updated Full Script');
                setShowFullScriptModel(false);
                fetchPhrases();
            }
        })
    }
    return (
        <>
            <NotificationContainer />

            <div className="call-table" style={{ width: "calc(100% - 444px)" }}>
                <div className="my-calls-column">
                    <div className="calls-top-pannel">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="pannel-heading clearfix">
                                    <div className="pannel-heading-info">
                                        <h3>Setup Call Script </h3>
                                    </div>
                                </div>
                                <div className="bradcums">
                                    <ul className="clearfix">
                                    </ul>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="pannel-nav clearfix">
                                    <ul className="clearfix">
                                        <li onClick={() => setShowNewModal(true)}><a>New Script Category</a></li>
                                        <li onClick={() => setShowFullScriptModel(true)}><a>Manage Full Script</a></li>
                                    </ul>
                                </div>
                                <div className="clear"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="view-list">
                    <ul class="nav nav-tabs">
                        {
                            scriptCategory &&
                            scriptCategory.map(item => (
                                item.name !== 'Full Script' &&
                                <li role="presentation" class={selectedTopTab == item.name ? "active" : ""} >
                                    <a onClick={() => changeCategory(item.name, item.id)} style={{ fontSize: "16px" }}>
                                        {item.name}
                                        &nbsp;&nbsp;
                                        {
                                            selectedTopTab == item.name &&
                                            <AiFillCloseCircle color="red" size="20" onClick={() => setShowDeleteModal(true)} />
                                        }
                                    </a>

                                </li>
                            ))
                        }
                    </ul>
                    <ul className="clearfix" style={{ paddingTop: "20px" }}>
                        <div>
                            {
                                phraseList &&
                                phraseList.map(item => (
                                    <h4 style={{ padding: "5px" }}><RiChatVoiceLine color="green" />&nbsp;&nbsp;{item.phrase}</h4>
                                ))
                            }
                        </div>
                        <div style={{ paddingTop: "20px" }}>
                            <a onClick={() => setShowPhraseAddModal(true)}> <b><AiOutlinePlus size="30" color="green" /></b></a>
                        </div>
                    </ul>
                </div>
            </div>

            <Modal
                isOpen={showNewModal}
                // onAfterOpen={afterOpenModal}
                // onRequestClose={closeModal}
                style={customStyles}
            // contentLabel="Example Modal"
            >

                <div className="col-md-12">
                    <div className="pannel-heading clearfix">
                        <div className="pannel-heading-info">
                            <h3>New Script Category </h3>
                        </div>
                    </div>

                    <hr />
                    <div className="my-calls-form">
                        <div className="row">
                            <div>
                                <div className="form-col clearfix">

                                    <label>Title </label><br />
                                    <input type="text" placeholder="Enter Script Category title..." value={newCategoryTitle} onChange={(e) => setNewCategoryTitle(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="popup-footer">

                            <>
                                <button className="btn" style={{ padding: "9px" }} type="button" onClick={() => setShowNewModal(false)} > Close  </button>
                                <button className="btn Save" style={{ padding: "9px" }} type="button" onClick={createNewScriptCategory} > Create  </button>
                            </>

                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <p className="errorColor"></p>
                            </div>
                        </div>
                    </div>




                </div>

            </Modal>

            <Modal
                isOpen={showDeleteModal}
                // onAfterOpen={afterOpenModal}
                // onRequestClose={closeModal}
                style={customStyles}
            // contentLabel="Example Modal"
            >

                <div className="col-md-12">
                    <div className="pannel-heading clearfix">
                        <div className="pannel-heading-info">
                            <h3>Are you sure, want to delete this Category </h3>
                        </div>
                    </div>

                    <hr />
                    <div className="my-calls-form">
                        <div className="row">
                            <div>
                                <div className="form-col clearfix">

                                    <label>Confirm Delete {selectedTopTab} </label><br />
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="popup-footer">

                            <>
                                <button className="btn" style={{ padding: "9px" }} type="button" onClick={() => setShowDeleteModal(false)} > Close  </button>
                                <button className="btn Save" style={{ padding: "9px" }} type="button" onClick={deleteCategory} > Confirm  </button>
                            </>

                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <p className="errorColor"></p>
                            </div>
                        </div>
                    </div>




                </div>

            </Modal>

            <Modal
                isOpen={showPhraseAddModal}
                // onAfterOpen={afterOpenModal}
                // onRequestClose={closeModal}
                style={customStyles}
            // contentLabel="Example Modal"
            >

                <div className="col-md-12">
                    <div className="pannel-heading clearfix">
                        <div className="pannel-heading-info">
                            <h3>Add New Phrases </h3>
                        </div>
                    </div>

                    <hr />
                    <div className="my-calls-form">
                        <div className="row">
                            <div>
                                <div className="form-col clearfix">

                                    <label>Phrase </label><br />
                                    <input type="text" style={{ width: "700px" }} placeholder="Enter Script Category title..." value={newPhrase} onChange={(e) => setNewPhrase(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="popup-footer">

                            <>
                                <button className="btn" style={{ padding: "9px" }} type="button" onClick={() => setShowPhraseAddModal(false)} > Close  </button>
                                <button className="btn Save" style={{ padding: "9px" }} type="button" onClick={createNewPhrase} > Create  </button>
                            </>

                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <p className="errorColor"></p>
                            </div>
                        </div>
                    </div>




                </div>

            </Modal>

            <Modal
                isOpen={showFullScriptModel}
                // onAfterOpen={afterOpenModal}
                // onRequestClose={closeModal}
                style={customStyles}
            // contentLabel="Example Modal"
            >

                <div className="col-md-12">
                    <div className="pannel-heading clearfix">
                        <div className="pannel-heading-info">
                            <h3>Add Full Script </h3>
                        </div>
                    </div>

                    <hr />
                    <div className="my-calls-form">
                        <div className="row">
                            <div>
                                <div className="form-col clearfix">

                                    <label>Script </label><br />
                                    <textarea type="text" style={{ width: "700px", height: "200px" }} placeholder="Enter full Script" value={fullScript} onChange={(e) => setFullScript(e.target.value)} ></textarea>
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="popup-footer">

                            <>
                                <button className="btn" style={{ padding: "9px" }} type="button" onClick={() => setShowFullScriptModel(false)} > Close  </button>
                                <button className="btn Save" style={{ padding: "9px" }} type="button" onClick={updateFullScript} > Update  </button>
                            </>

                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <p className="errorColor"></p>
                            </div>
                        </div>
                    </div>




                </div>

            </Modal>


        </>
    );
}

export default ScriptSetup;