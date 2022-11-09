import { useEffect, useState } from 'react';
import Service from './../webservice/http';
import Modal from 'react-modal';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import MultipleValueTextInput from 'react-multivalue-text-input';
import ReactDOM from 'react-dom';
import { BiEditAlt } from 'react-icons/bi';
import { BsCheckLg, BsFillCheckCircleFill, BsFillExclamationCircleFill } from 'react-icons/bs';
import { FaTimes, FaTimesCircle } from 'react-icons/fa';



const CheckPoint = () => {
    const services = new Service();

    useEffect(() => {
        fetchData();
        fetchProduct();
    }, [])

    const [productCheckpointMap, setProductCheckpointMap] = useState(null);
    const [productList, setProductList] = useState(null);

    /**
     * Fetch product checkpoint map data
     */
    function fetchData() {
        services.get(`/api/call_quality/product_checkpoint_map/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setProductCheckpointMap(res);
            }
        })
    }

    /**
     * Fetch available products fro the client 
     */
    function fetchProduct() {
        services.get(`/api/call_quality/available_products/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setProductList(res);
            }
        })
    }


    const [showCreateMapModal, setShowCreateMapModal] = useState(false);
    const [showDeleteMapModal, setShowDeleteMapModal] = useState(false);
    const [mapOperationInfo, setMapOperationInfo] = useState(null);


    /**
     * Display create map popup confirmation
     * @param {} product Product Name
     * @param {*} checkPoint Checkpoint
     */
    function displayCreateMap(product, checkPoint) {
        setShowDeleteMapModal(false);
        setShowCreateMapModal(true);
        console.log('--------------------------------')
        console.log(product, checkPoint);
        console.log('--------------------------------')
        setMapOperationInfo([product, checkPoint]);
    }

    /**
     * Display delete map popup confirmation
     * @param {*} product Product
     * @param {*} checkPoint Ceckpoint
     */
    function displayDeleteMap(product, checkPoint) {
        setShowCreateMapModal(false);
        setShowDeleteMapModal(true);
        setMapOperationInfo([product, checkPoint]);
    }


    /**
     * Map and unmap product and checkpoint
     * @param {*} type Type
     */
    function mapOperation(type) {
        if (type === 'create') {
            var data = {
                'product_id': mapOperationInfo[0],
                'checkpoint_id': mapOperationInfo[1]
            }
        }
        else {
            var data = {
                'product_id': mapOperationInfo[0],
                'checkpoint_id': mapOperationInfo[1]
            }
        }
        console.log(data)
        services.post(`/api/call_quality/product_checkpoint_map/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                if (res.message === 'success') {
                    NotificationManager.success('success', 'Added New Phrase');
                    setShowCreateMapModal(false);
                    setShowDeleteMapModal(false);
                    setMapOperationInfo(null);
                    fetchData();
                }
            }
        })
    }

    /**
     * Polulate Checkppoint and product map config data
     * create html and render
     */
    useEffect(() => {

        try {
            var insideHtml = [];
            var tempProductCheckpointMap = productCheckpointMap;

            for (let i = 0; i < productList.length; i++) {
                var insideHtml2 = [<td> {productList[i].title} </td>];
                for (let j = 0; j < tempProductCheckpointMap.length; j++) {
                    // var found = false;
                    var index = -1;
                    for (let k = 0; k < tempProductCheckpointMap[j].product_detail.length; k++) {
                        if (tempProductCheckpointMap[j].product_detail[k].id === productList[i].id) {
                            // found = true;
                            index = k
                            // tempMapID = productCheckpointMap[j].product_detail[k].map_id
                            break;
                        }
                    }
                    if (index !== -1) {
                        // // console.log('-------');
                        // console.log(index)
                        // console.log(tempProductCheckpointMap[j].product_detail[index].map_id)
                        // console.log('-----------')
                        var mapID = '';
                        mapID = tempProductCheckpointMap[j].product_detail[index].map_id;
                        console.log('mapID', mapID, index);
                        insideHtml2.push(<td><p onClick={() => displayDeleteMap(productList[i].id, tempProductCheckpointMap[j].checkpoint_id)}><BsCheckLg size="22" color="green" /></p></td>);
                    }
                    else {
                        insideHtml2.push(<td><p onClick={() => displayCreateMap(productList[i].id, tempProductCheckpointMap[j].checkpoint_id)}><FaTimes size="22" color="red" /></p></td>);
                    }
                }
                insideHtml.push(<tr>{insideHtml2}</tr>);
            }
            // setInsideHTML(insideHtml);
            console.log('--------------------------------', insideHtml);
            ReactDOM.render(insideHtml, document.getElementById('productMapID'));
        }
        catch (e) { console.log(e); }
    }, [productCheckpointMap, productList,])

    const [showNewCheckpointModal, setShowNewCheckpointModal] = useState(false);

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

    const [checkPointTitle, setCheckpointTitle] = useState('');
    const [identificationKeyword, setIdentificationKeyword] = useState([]);

    /**
     * 
     * Create new checkoint for the specific client and populate
     */
    const createNewCheckpoint = () => {
        if (checkPointTitle === '' || identificationKeyword.length == 0) {
            NotificationManager.error('error', 'Both the fields are mandatory');
            return;
        }
        var data = {
            'name': checkPointTitle,
            'identification_keyword': identificationKeyword
        }
        services.post(`/api/call_quality/checkpoint/`, data).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                if (res.message === 'success') {
                    NotificationManager.success('success', 'Added New Phrase');
                    setShowNewCheckpointModal(false);
                    setCheckpointTitle('');
                    setIdentificationKeyword([]);
                    fetchData();
                }
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
                                        <h3>Setup Checkpoint </h3>
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
                                        <li onClick={() => setShowNewCheckpointModal(true)}><a>New Checkpoint</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <table className="ss">
                    <thead>
                        <tr>
                            <th></th>

                            {
                                productCheckpointMap &&
                                productCheckpointMap.map(mapItem => (
                                    <th>
                                        <p>
                                            {mapItem.checkpoint_name}
                                        </p>
                                    </th>

                                ))
                            }

                        </tr>
                    </thead>
                    <tbody id="productMapID">
                    </tbody>
                </table>



            </div>


            <Modal
                isOpen={showNewCheckpointModal}
                // onAfterOpen={afterOpenModal}
                // onRequestClose={closeModal}
                style={customStyles}
            // contentLabel="Example Modal"
            >

                <div className="col-md-12">
                    <div className="pannel-heading clearfix">
                        <div className="pannel-heading-info">
                            <h3>New Checkpoint </h3>
                        </div>
                    </div>

                    <hr />
                    <div className="my-calls-form">
                        <div className="row">
                            <div>
                                <div className="form-col clearfix">

                                    <label>Title </label><br />
                                    <input type="text" placeholder="Enter Script Category title..." value={checkPointTitle} onChange={(e) => setCheckpointTitle(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div>
                                <div className="form-col clearfix">

                                    <label> Identification Keyword </label><br />
                                    <MultipleValueTextInput
                                        onItemAdded={(item, allItems) => setIdentificationKeyword(allItems)}
                                        onItemDeleted={(item, allItems) => setIdentificationKeyword(allItems)}
                                        // label=""
                                        name="item-input"
                                        placeholder="Enter whatever items you want; separate them with COMMA or ENTER."
                                    // values={["default value", "another default value"]}
                                    />

                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="popup-footer">

                            <>
                                <button className="btn" style={{ padding: "9px" }} type="button" onClick={() => setShowNewCheckpointModal(false)} > Close  </button>
                                <button className="btn Save" style={{ padding: "9px" }} type="button" onClick={createNewCheckpoint} > Create  </button>
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
                isOpen={showDeleteMapModal}
                style={customStyles}
            >
                <div className="col-md-12">
                    <div className="pannel-heading clearfix">
                        <div className="pannel-heading-info">
                            <h3> <FaTimesCircle size="25" color="red" style={{ paddingTop: "10px" }} />&nbsp;Disable Checkpoint ? </h3>
                        </div>
                    </div>

                    <hr />
                    <div className="my-calls-form">
                        <div className="popup-footer">
                            <>
                                <button className="btn" style={{ padding: "9px" }} type="button" onClick={() => setShowDeleteMapModal(false)} > Close  </button>
                                <button className="btn Save" style={{ padding: "9px" }} type="button" onClick={() => mapOperation('delete')}> Save  </button>
                            </>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showCreateMapModal}
                style={customStyles}
            >
                <div className="col-md-12">
                    <div className="pannel-heading clearfix">
                        <div className="pannel-heading-info">
                            <h3><a ><BsFillCheckCircleFill size="25" color="green" style={{ paddingTop: "10px" }} /></a>&nbsp;Enable Checkpoint ? </h3>
                        </div>
                    </div>

                    <hr />
                    <div className="my-calls-form">
                        <div className="popup-footer">
                            <>
                                <button className="btn" style={{ padding: "9px" }} type="button" onClick={() => setShowCreateMapModal(false)} > Close  </button>
                                <button className="btn Save" style={{ padding: "9px" }} type="button" onClick={() => mapOperation('create')} > Save  </button>
                            </>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default CheckPoint;