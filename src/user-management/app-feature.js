import Header from "./../header/header";
import Footer from "./../footer/footer";
import NavBar from "./../nav/nav-bar";
import { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import Service from './../webservice/http';
import { Link } from "react-router-dom";

const AppFeature = ({ loginStatus }) => {

    const [featureList, setFeatureList] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const services = new Service();
    const history = useHistory();


    /**
     * Fetch App feature from which are available for the client
     */
    function fetchData() {
        services.get('/api/access_control/feature_action/').then(res => {
            console.log(res);
            setIsPending(false);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {
                setFeatureList(res);
                setError(null);
            }
        })
    }


    useEffect(() => {
        if (!loginStatus) {
            history.push("/login");
        }
        setFeatureList(null);
        setIsPending(true);
        setError(null);
        fetchData();

    }, [loginStatus, history,]);


    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <div>
                <div className="container-fluid">
                    <div className="my-call">


                        <div className="side-panel-with-table clearfix">
                            <div className="side-panel">

                                <nav className="secondary-menu">
                                    <ul>
                                        <li><Link to='/user-management/manage-user'><i className="fa fa-user" aria-hidden="true"></i><a>User</a></Link></li>
                                        <li><Link to='/user-management/manage-role'><i className="fa fa-address-book-o" aria-hidden="true"></i><a>Role</a></Link></li>
                                        <li className="active"><Link to='/user-management/app-feature'><i className="fa fa-hand-peace-o" aria-hidden="true"></i><a>App Feature</a></Link></li>
                                    </ul>
                                </nav>
                            </div>
                            <div className="call-table">
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-lg-6">
                                                <div className="pannel-heading clearfix">
                                                    <div className="pannel-heading-info">
                                                        <p>Application Features </p>
                                                        <h3>Features </h3>
                                                    </div>
                                                </div>
                                                <div className="bradcums">
                                                    <ul className="clearfix">
                                                        <li> <i className="fa fa-circle" aria-hidden="true"></i> {featureList && featureList.length} Items</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="pannel-nav clearfix">
                                                    <ul className="clearfix">

                                                    </ul>
                                                </div>
                                                <div className="clear"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <table className="ss">
                                    <thead>

                                    </thead>
                                    <tbody>

                                        {
                                            featureList && (
                                                featureList.map(feature => (
                                                    <tr>
                                                        <td>
                                                            <p className="blue">{feature.feature}</p>
                                                        </td>

                                                    </tr>
                                                ))
                                            )
                                        }


                                    </tbody>
                                </table>

                                {isPending &&
                                    (<div className="empty-call">
                                        Loading...
                                    </div>)}

                                {error &&
                                    (<div className="empty-call">
                                        {error}
                                    </div>)}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

        </div>
    );
}

export default AppFeature;