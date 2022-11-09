import Header from './../../header/header';
import Footer from './../../footer/footer';
import NavBar from './../../nav/nav-bar';
import Filter from './filter';
import { FaFilter } from "react-icons/fa";
import { useEffect, useState } from 'react';
import OpportunityAnalysis from './opportunity-analysis';
import ServiceRequestAnalysis from './servicerequest-analysis';
import SpeechDeviationAnalysis from './speech-deviation-analysis';
import CXAnalysis from './cx-analysis';
import Service from './../../webservice/http';
import { useHistory } from "react-router-dom";

const DashboardHome = () => {

    const history = useHistory();
    const services = new Service();


    const [sideBarWidth, setSideBarWidth] = useState(0);
    const changeSideBarWidth = () => {
        if (sideBarWidth == 570) {
            setSideBarWidth(0);
        }
        else {
            setSideBarWidth(570);
        }
    }

    const [filterData, setFilterData] = useState(null);

    const [showRealData, setShowRealData] = useState(false);


    /**
       * Fetch configuration from backend and decide wheather to show dummy data or real data
       */
    function fetchDataConfig() {
        services.get('/api/appconfig/dummy_data_api/').then(res => {
            console.log(res);
            if (res === 'TypeError: Failed to fetch') {
                // setError('Connection Error');
            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    res.map(item => {
                        if (item.page === 'Report') {
                            if (item.status == true) {
                                console.log('===============')
                                setShowRealData(true);
                                // fetchData();
                                // return;
                            }
                            else {
                                console.log("----------------")
                                setShowRealData(false);
                                // chnageData();
                                // return;
                            }
                        }
                    })
                }
                catch (e) {
                    // setError(e);
                    console.log(e);
                }
            }
        })
    }

    useEffect(() => {
        fetchDataConfig();
    }, [])

    return (
        <div className="dashboard-body" style={{ transition: ".5s" }}>
            <Header />
            <NavBar />
            <a onClick={changeSideBarWidth} style={{
                position: "fixed",
                transition: ".5s",
                top: "18%",
                right: sideBarWidth,
                backgroundColor: "#F99E52",
                color: "white",
                borderTopColor: "black",
                borderWidth: "2px",
                boxShadow: "6px 6px 3px #999",
                paddingTop: "15px",
                paddingLeft: "5px",
                paddingRight: "5px",
                height: "45px",
                zIndex: "2"
            }}>
                <FaFilter size="20" />
            </a>
            <Filter width={sideBarWidth} changeSideBarWidth={changeSideBarWidth} filterDataFunction={setFilterData} />
            {
                sideBarWidth == 570 &&
                <div className="backdrop" style={{ zIndex: 1, height: "2500px" }}></div>
            }
            <section className="page-body">
                <div className="section-one clearfix">
                    <div className="container-fluid">
                        <OpportunityAnalysis filterData={filterData} showRealData={showRealData} />
                        {/* <ServiceRequestAnalysis filterData={filterData} />
                        <SpeechDeviationAnalysis filterData={filterData} />
                        <CXAnalysis filterData={filterData} /> */}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default DashboardHome;