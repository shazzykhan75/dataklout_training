import { Link } from "react-router-dom";
import "./../reports/report-nav.css";
import { BsFillCollectionFill } from "react-icons/bs";
import { VscActivateBreakpoints } from "react-icons/vsc";


const ReportNav = () => {
    var url = window.location.href;
    url = url.replace(/^.*\/\/[^\/]+/, '');

    return (
        <div className="side-panel">

            <nav className="secondary-menu">
                <ul>
                    <li className={url === '/reports/customer-intent' ? 'active' : ''}><Link to='/reports/customer-intent'>
                        <i className="fa fa-tachometer" aria-hidden="true"></i>
                        <a style={{ fontSize: "14px" }}> Customer Intent</a></Link>
                    </li>
                    <li className={url === '/reports/product-intent' ? 'active' : ''}><Link to='/reports/product-intent'>
                        <i className="flaticon-analytics"></i>
                        <a style={{ fontSize: "14px" }}>Product by Intent</a></Link>
                    </li>
                    <li className={url === '/reports/cx-score-trend' ? 'active' : ''}><Link to='/reports/cx-score-trend'>
                        <i className="fa fa-line-chart" aria-hidden="true"></i>
                        <a style={{ fontSize: "14px" }}>CX Score Trend</a></Link>
                    </li>
                    <li className={url === '/reports/manager-review' ? 'active' : ''}><Link to='/reports/manager-review'>
                        <i className="fa fa-comment" aria-hidden="true"></i>
                        <a style={{ fontSize: "14px" }}>Manager Review</a></Link>
                    </li>
                    <li className={url === '/reports/opportunity' ? 'active' : ''}><Link to='/reports/opportunity'>
                        <i className="fa fa-snowflake-o" aria-hidden="true"></i>
                        <a style={{ fontSize: "14px" }}>Opportunities</a></Link>
                    </li>
                    <li className={url === '/reports/service-request' ? 'active' : ''}><Link to='/reports/service-request'>
                        <i className="fa fa-superpowers" aria-hidden="true"></i>
                        <a style={{ fontSize: "14px" }}>Service Request</a></Link>
                    </li>
                    {
                        localStorage.getItem('collection_module') === 'true' &&
                        <li className={url === '/reports/collection' ? 'active' : ''}><Link to='/reports/collection'>
                            <BsFillCollectionFill />
                            <a style={{ fontSize: "14px" }}>Collection</a></Link>
                        </li>
                    }
                    {
                        localStorage.getItem('collection_module') === 'true' &&
                        <li className={url === '/reports/performance' ? 'active' : ''}><Link to='/reports/performance'>
                            <VscActivateBreakpoints />
                            <a style={{ fontSize: "14px" }}>Performance</a></Link>
                        </li>
                    }
                    {
                        localStorage.getItem('stock_broking_module') === 'true' &&
                        <li className={url === '/reports/compliance' ? 'active' : ''}><Link to='/reports/compliance'>
                            <VscActivateBreakpoints />
                            <a style={{ fontSize: "14px" }}>Compliance </a></Link>
                        </li>
                    }
                </ul>
            </nav>
        </div>

    );
}

export default ReportNav;