import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Service from './../webservice/http';
import { useHistory } from "react-router-dom";

const NavBar = () => {
    const services = new Service();
    var url = window.location.href;
    url = url.replace(/^.*\/\/[^\/]+/, '');
    const [permission, setPermission] = useState();

    const history = useHistory();


    /**
     * Fetch all the permission details for the logged in user
     * 
     * Based on permission details nav will be populated
     * 
     */
    function fetch_permissionDetails() {
        services.get('/api/access_control/permission_details/').then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {

            }
            else {
                try {
                    if (res.code == 'token_not_valid') {
                        localStorage.clear();
                        history.push("/login");
                    }
                    setPermission(res);
                }
                catch (e) {
                    console.log(e);
                }


            }
        })
    }

    useEffect(() => {
        fetch_permissionDetails();
    }, [url])

    return (
        <div className="main-nav clearfix">
            <div className="sale" style={{ fontSize: "14px" }}><div><img src="/assets/images/grid.png" className="img-responsive" alt="" /> {localStorage.getItem('usecase')}</div></div>
            <div className="main-menu">
                <nav className="nav-primary">
                    <ul key="ul" className="menu-main-navigation menu clearfix">
                        <li key="home" className={url === '/' ? 'active' : ''}><Link to={'/'}>Home</Link></li>
                        {
                            permission && permission.map((p) => (
                                <>
                                    {
                                        p.feature == 'Call List' &&
                                        <li key={p.feature} className={url === '/call-list' ? 'active' : ''}> <Link to={'/call-list'}>Calls</Link></li>
                                    }
                                </>

                            ))
                        }


                        {
                            permission && permission.map((p) => (
                                <>

                                    {
                                        p.feature == 'Dashboard' &&
                                        <li key={p.feature} className={url === '/dashboard' ? 'active' : ''}> <Link to={'/dashboard'}>Dashboard</Link></li>
                                    }
                                </>

                            ))
                        }


                        {
                            permission && permission.map((p) => (
                                <>

                                    {
                                        p.feature == 'Opportunity' &&
                                        <li key={p.feature} className={url === '/call/opportunities' ? 'active' : ''}> <Link to={'/call/opportunities'}>Opportunities</Link></li>
                                    }
                                </>

                            ))
                        }


                        {
                            permission && permission.map((p) => (
                                <>
                                    {
                                        p.feature == 'Service Request' &&
                                        <li key={p.feature} className={url === '/call/service-requests' ? 'active' : ''}> <Link to={'/call/service-requests'}>Service Requests</Link></li>
                                    }
                                </>

                            ))
                        }


                        {
                            permission && permission.map((p) => (
                                <>

                                    {
                                        p.feature == 'Archrive Call' &&
                                        <li key={p.feature} className={url === '/call/archive-calls' ? 'active' : ''}> <Link to={'/call/archive-calls'}>Archived Calls</Link></li>
                                    }

                                </>

                            ))
                        }

                        {
                            permission && permission.map((p) => (
                                <>
                                    {
                                        p.feature == 'Contact' &&
                                        <li key={p.feature} className={url.substr(0, 8) === '/contact' ? 'active' : ''}> <Link to={'/contact'}>Contact</Link></li>
                                    }
                                </>

                            ))
                        }

            <li>
            <Link to="/Training/Collection/">Collection</Link>
          </li>

         
          <li>
            <Link to="/Training/Schedulerteams">Scheduler</Link>
          </li>



                        {
                            permission && permission.map((p) => (
                                <>
                                    {
                                        p.feature == 'Task' &&
                                        <li key={p.feature} className={url === '/task' ? 'active' : ''}> <Link to={'/task'}>Task</Link></li>
                                    }

                                </>

                            ))
                        }

                        {
                            permission && permission.map((p) => (
                                <>

                                    {
                                        p.feature == 'User Management' &&
                                        <li key={p.feature} className={url.substr(0, 16) === '/user-management' ? 'active' : ''}> <Link to={'/user-management/manage-user'}>User Management</Link></li>
                                    }


                                </>

                            ))
                        }

                        {
                            permission && permission.map((p) => (
                                <>

                                    {
                                        p.feature == 'Quality Audit' &&
                                        <li key={p.feature} className={url.substr(0, 16) === '/quality-audit' ? 'active' : ''}> <Link to={'/quality-audit'}>Quality Audit</Link></li>
                                    }


                                </>

                            ))
                        }

                        {
                            permission && permission.map((p) => (
                                <>


                                    {
                                        p.feature == 'Report' &&
                                        <li key={p.feature} className={url.substr(0, 8) === '/reports' ? 'active' : ''}> <Link to={'/reports/customer-intent'}>Reports</Link></li>
                                    }
                                </>

                            ))
                        }

                    </ul>
                </nav>
                <div className="toggle-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}

export default NavBar;