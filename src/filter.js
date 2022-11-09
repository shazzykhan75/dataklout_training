import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Service from './webservice/http';
import { useHistory } from "react-router-dom";
import 'react-rangeslider/lib/index.css';
import RangeSlider from 'rsuite/RangeSlider';
import "rsuite/dist/rsuite.min.css";

const Filter = (props) => {
    const history = useHistory();
    const services = new Service();

    const [selectionRange, setSelectionRange] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    })

    const [agreeability, setAgreeability] = useState(0);
    const handleAgreeability = value => {
        setAgreeability(value);
    }

    useEffect(() => {
        fetchFilter();
    }, []);

    /**
     * Manage selected date range from the calander
     * @param {*} ranges Date Range -> Start Date and End Date
     */

    const handleDateRangeSelect = (ranges) => {
        console.log(ranges.selection);
        setSelectionRange(ranges.selection);
        var tempFilterData = filterData;
        tempFilterData.start_date = ranges.selection.startDate;
        tempFilterData.end_date = ranges.selection.endDate;
        setFilterData(tempFilterData);
    }

    const [filterData, setFilterData] = useState(null);

    /**
     * Fetch existing filter config 
     */
    function fetchFilter() {
        services.get(`/api/filter/manage/${props.filterType}/`).then(res => {
            console.log('--------------------')
            console.log(res);
            console.log('--------------------')
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                setFilterData(res);
                if (res.start_date !== '' && res.end_date !== '') {
                    try {
                        setSelectionRange({ startDate: new Date(res.start_date), endDate: new Date(res.end_date), key: 'selection' });
                    }
                    catch { }
                }
            }
        })
    }


    /**
     * change filter config data based on input 
     * @param {*} type Filter Type
     * @param {*} id Filter ID
     */
    function changeFilterJSON(type, id) {
        console.log(type, id)
        var tempFilterData = filterData
        if (type === 'product') {
            for (let i = 0; i < tempFilterData.products.length; i++) {
                if (tempFilterData.products[i].id === id) {
                    tempFilterData.products[i].status = !tempFilterData.products[i].status;
                    break;
                }
            }
        }
        if (type === 'repoter') {
            for (let i = 0; i < tempFilterData.repoters.length; i++) {
                if (tempFilterData.repoters[i].username === id) {
                    tempFilterData.repoters[i].status = !tempFilterData.repoters[i].status;
                    break;
                }
            }
        }
        if (type === 'sentiment') {
            for (let i = 0; i < tempFilterData.sentiment.length; i++) {
                if (tempFilterData.sentiment[i].type === id) {
                    tempFilterData.sentiment[i].status = !tempFilterData.sentiment[i].status;
                    break;
                }
            }
        }
        if (type === 'intent') {
            for (let i = 0; i < tempFilterData.intent.length; i++) {
                if (tempFilterData.intent[i].type === id) {
                    tempFilterData.intent[i].status = !tempFilterData.intent[i].status;
                    break;
                }
            }
        }
        if (type === 'pitch') {
            for (let i = 0; i < tempFilterData.pitch.length; i++) {
                if (tempFilterData.pitch[i].type === id) {
                    tempFilterData.pitch[i].status = !tempFilterData.pitch[i].status;
                    break;
                }
            }
        }
        if (type === 'loudness') {
            tempFilterData.loudness['max'] = id[1]
            tempFilterData.loudness['min'] = id[0]
        }
        if (type === 'aggreability') {
            tempFilterData.aggreability['max'] = id[1]
            tempFilterData.aggreability['min'] = id[0]
        }
        setFilterData(tempFilterData);
        console.log(tempFilterData)
    }


    /**
     * Save filter config to db for future reference
     */
    const saveFilter = () => {
        services.post(`/api/filter/manage/${props.filterType}/`, filterData).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                if (res.message === 'success') {
                    console.log("Applied filter")
                    props.changeSideBarWidth();
                    props.filterHasChanged();
                }
            }
        })
    }


    /**
     * Delete filter, it will work as reset filter
     */
    const deleteFilter = () => {
        services.delete(`/api/filter/manage/${props.filterType}/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                if (res.code == 'token_not_valid') {
                    localStorage.clear();
                    history.push("/login");
                }
                if (res.message === 'success') {
                    console.log("reseted filter");
                    setFilterData(null);
                    fetchFilter();
                }
            }
        })
    }

    const handleLoudnessChange = value => {
        changeFilterJSON('loudness', value)
    }

    const handlAggreabilityChange = value => {
        changeFilterJSON('aggreability', value)
    }

    // useEffect(() => {
    //     props.filterDataFunction(filterData);
    // }, [filterData])

    return (
        <>
            <div className="filterDiv" style={{
                height: "100%",
                width: props.width,
                position: "fixed",
                zIndex: "2",
                top: "0",
                right: "0",
                backgroundColor: "#DEE3E8",
                overflowX: "hidden",
                transition: "0.5s",
                paddingTop: "60px",
                // borderLeftStyle: "solid",
                // borderLeftColor: "orange",
                // borderLeftWidth: "3px"
            }}>

                <div style={{ padding: "4px 4px 4px 4px" }}>
                    <DateRangePicker
                        ranges={[selectionRange]}
                        onChange={handleDateRangeSelect}
                    />

                    <div className="my-calls-form" style={{ paddingBottom: "1px" }}>
                        <div className="my-calls-column">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-col clearfix">
                                        <p className="blue">Agents</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {
                                    filterData &&
                                    filterData.repoters.map(agent => (
                                        <div className="col-md-6">
                                            <div className="select-check">
                                                <label className="checkbox-container" style={{ fontSize: "15px" }}>
                                                    {agent.first_name}&nbsp;{agent.last_name}
                                                    <input type="checkbox" defaultChecked={agent.status} onChange={() => changeFilterJSON('repoter', agent.username)} />
                                                    <span className="checkmark"></span>

                                                </label>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="my-calls-form" style={{ paddingBottom: "1px" }}>
                        <div className="my-calls-column">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-col clearfix">
                                        <p className="blue">Products</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {
                                    filterData &&
                                    filterData.products.map(productItem => (
                                        <div className="col-md-6">
                                            <div className="select-check">
                                                <label className="checkbox-container" style={{ fontSize: "15px" }}>
                                                    {productItem.product}
                                                    <input type="checkbox" defaultChecked={productItem.status} onChange={() => changeFilterJSON('product', productItem.id)} />
                                                    <span className="checkmark"></span>

                                                </label>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="my-calls-form" style={{ paddingBottom: "1px" }}>
                        <div className="my-calls-column">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-col clearfix">
                                        <p className="blue">Sentiment</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {
                                    filterData &&
                                    filterData.sentiment.map(sentimentItem => (
                                        <div className="col-md-6">
                                            <div className="select-check">
                                                <label className="checkbox-container" style={{ fontSize: "15px" }}>
                                                    {sentimentItem.type}
                                                    <input type="checkbox" defaultChecked={sentimentItem.status} onChange={() => changeFilterJSON('sentiment', sentimentItem.type)} />
                                                    <span className="checkmark"></span>

                                                </label>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="my-calls-form" style={{ paddingBottom: "1px" }}>
                        <div className="my-calls-column">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-col clearfix">
                                        <p className="blue">Intent</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {
                                    filterData &&
                                    filterData.intent.map(intentItem => (
                                        <div className="col-md-6">
                                            <div className="select-check">
                                                <label className="checkbox-container" style={{ fontSize: "15px" }}>
                                                    {intentItem.type}
                                                    <input type="checkbox" defaultChecked={intentItem.status} onChange={() => changeFilterJSON('intent', intentItem.type)} />
                                                    <span className="checkmark"></span>

                                                </label>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="my-calls-form" style={{ paddingBottom: "1px" }}>
                        <div className="my-calls-column">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-col clearfix">
                                        <p className="blue">Pitch Variance</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                {
                                    filterData &&
                                    filterData.pitch.map(pitchItem => (
                                        <div className="col-md-6">
                                            <div className="select-check">
                                                <label className="checkbox-container" style={{ fontSize: "15px" }}>
                                                    {pitchItem.type}
                                                    <input type="checkbox" defaultChecked={pitchItem.status} onChange={() => changeFilterJSON('pitch', pitchItem.type)} />
                                                    <span className="checkmark"></span>

                                                </label>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="my-calls-form" style={{ paddingBottom: "1px" }}>
                        <div className="my-calls-column">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-col clearfix">
                                        <p className="blue">Agreeability</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div style={{ paddingLeft: "20px", paddingRight: "20px" }}>
                                    <div className="col-sm-12">
                                        {
                                            filterData &&
                                            <RangeSlider defaultValue={[filterData.aggreability.min, filterData.aggreability.max]} onChange={handlAggreabilityChange} />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="my-calls-form" style={{ paddingBottom: "1px" }}>
                        <div className="my-calls-column">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-col clearfix">
                                        <p className="blue">Loudness</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div style={{ paddingLeft: "20px", paddingRight: "20px" }}>
                                    <div className="col-sm-12">
                                        {
                                            filterData &&
                                            <RangeSlider min={200} max={20000} step={100} defaultValue={[filterData.loudness.min, filterData.loudness.max]} onChange={handleLoudnessChange} />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <button className="btn Save pull-right" style={{ backgroundColor: "#271078", color: "white" }} type="button" onClick={saveFilter}> Apply  </button>
                    <button className="btn Save pull-left" style={{ backgroundColor: "rgb(249, 158, 82)", color: "white" }} type="button" onClick={deleteFilter}> Reset  </button>
                </div>
            </div>

        </>
    );
}

export default Filter;