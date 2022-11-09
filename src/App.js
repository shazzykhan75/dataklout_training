import Login from "./auth/login";
import CheckLoginStatus from "./auth/check-login-status";
import CallList from "./call-list";
import Home from "./home";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import CallInsight from "./call-insight";
import Leads from './opportunities';
import ServiceRequests from "./service-requests";
import ArchiveCall from "./archive-call";
import DeepAnalysis from "./deep-analysis";
import Contact from "./contact";
import LeadDetails from "./opportunity-details";
import SRDetails from "./service-request-details";
import ManageUser from "./user-management/manage-user";
import ManageRole from "./user-management/manage-role";
import AppFeature from "./user-management/app-feature";
import CustomerIntentReport from "./reports/customer-intent";
import ProductIntentReport from "./reports/product-intent";
import CXScoreTrendReport from "./reports/cx-score-trend";
import ManagerReviewReport from "./reports/mamager-review";
import OpportunityReport from "./reports/opportunity";
import ServiceRequestReport from "./reports/service-request";
import CollectionReport from "./reports/collection";
import Performance from "./reports/performance";
import Task from "./task";
import ContactDetail from "./contact-detail";
import LiveCall from "./live-call";
import Account from "./account";
import QualityHome from "./quality/quality-home";
import DashboardHome from "./reports/dashboard/home";
import ComplianceReport from './reports/compliance';
// import Calendar from "./Calendar";

import Schedulerteams from "./Training/Schedulerteams";
import Form from './Training/Form'
import Collection from "./Training/Collection";

function App() {
  /**
  * Application Initialization Point
  * 
  * Navigate to different Components based on router link
  */
  const { loginStatus } = CheckLoginStatus();
  return (
    <Router>
      <div className="App">
        <Switch>

          <Route exact path="/">
            <Home loginStatus={loginStatus} />
          </Route>

          <Route exact path="/login">
            <Login loginStatus={loginStatus} />
          </Route>

          <Route exact path="/call-list">
            <CallList loginStatus={loginStatus} />
          </Route>

          <Route exact path="/call/:callID/call-insight">
            <CallInsight loginStatus={loginStatus} />
          </Route>

          <Route exact path="/call/:callID/deep-analysis">
            <DeepAnalysis loginStatus={loginStatus} />
          </Route>

          <Route exact path="/call/opportunities">
            <Leads loginStatus={loginStatus} />
          </Route>

          <Route exact path="/call/:leadID/opportunity-details">
            <LeadDetails loginStatus={loginStatus} />
          </Route>

          <Route exact path="/call/service-requests">
            <ServiceRequests loginStatus={loginStatus} />
          </Route>

          <Route exact path="/call/:srID/sr-details">
            <SRDetails loginStatus={loginStatus} />
          </Route>

          <Route exact path="/call/archive-calls">
            <ArchiveCall loginStatus={loginStatus} />
          </Route>

          <Route exact path="/contact">
            <Contact loginStatus={loginStatus} />
          </Route>

          <Route exact path="/contact/:contactId">
            <ContactDetail loginStatus={loginStatus} />
          </Route>

          <Route exact path="/user-management/manage-user">
            <ManageUser loginStatus={loginStatus} />
          </Route>

          <Route exact path="/user-management/manage-role">
            <ManageRole loginStatus={loginStatus} />
          </Route>

          <Route exact path="/user-management/app-feature">
            <AppFeature loginStatus={loginStatus} />
          </Route>

          <Route exact path="/reports/customer-intent">
            <CustomerIntentReport loginStatus={loginStatus} />
          </Route>
        

          <Route exact path="/reports/product-intent">
            <ProductIntentReport loginStatus={loginStatus} />
          </Route>

          <Route exact path="/reports/cx-score-trend">
            <CXScoreTrendReport loginStatus={loginStatus} />
          </Route>

          <Route exact path="/reports/manager-review">
            <ManagerReviewReport loginStatus={loginStatus} />
          </Route>

          <Route exact path="/reports/opportunity">
            <OpportunityReport loginStatus={loginStatus} />
          </Route>

          <Route exact path="/reports/service-request">
            <ServiceRequestReport loginStatus={loginStatus} />
          </Route>

          <Route exact path="/reports/collection">
            <CollectionReport loginStatus={loginStatus} />
          </Route>

          <Route exact path="/reports/performance">
            <Performance loginStatus={loginStatus} />
          </Route>

         
          <Route exact path="/Training/Schedulerteams">
            <Schedulerteams loginStatus={loginStatus} />
          </Route>

          <Route exact path="/Training/Schedulerteams">
            <Schedulerteams loginStatus={loginStatus} />
          </Route>

          <Route exact path="/Training/Form">
            <Form loginStatus={loginStatus} />
          </Route>

          <Route exact path="/Training/Collection">
            <Collection loginStatus={loginStatus} />
          </Route>

          <Route exact path="/reports/compliance">
            <ComplianceReport loginStatus={loginStatus} />
          </Route>

          <Route exact path="/task">
            <Task loginStatus={loginStatus} />
          </Route>

          <Route exact path="/live-call">
            <LiveCall />
          </Route>

          <Route exact path="/account">
            <Account />
          </Route>

          <Route exact path="/quality-audit">
            <QualityHome />
          </Route>

          <Route exact path="/dashboard">
            <DashboardHome />
          </Route>

        </Switch>

      </div>
    </Router>
  );
}

export default App;
