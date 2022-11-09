import Header from './header/header';
import Footer from './footer/footer';
import NavBar from './nav/nav-bar';
import { useEffect, useState } from 'react';
import Multiselect from 'multiselect-react-dropdown';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import Service from './webservice/http';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './task.css';


const Task = () => {

    const services = new Service();
    const [forMeNav, setForMeNav] = useState('active');
    const [createdTaskNav, setCreatedTaskNav] = useState('');
    const [userOptions, setUserOptions] = useState();
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');
    const [priority, setPriority] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [reminder, setReminder] = useState('');
    const [assignTo, setAssignTo] = useState([]);
    const [error, setError] = useState('');
    const [createdTaskList, setCreatedTaskList] = useState(null);
    const [assignedTaskList, setAssignedTaskList] = useState(null);

    const [showNewTask, setShowNewTask] = useState(false);
    const [showCretaedTaskDetail, setShowCretaedTaskDetail] = useState(false);
    const [showAssignedTaskDetail, setShowAssignedTaskDetail] = useState(false);

    const [showClosed, setShowClosed] = useState(false);

    const onSelectName = (selectedList, selectedItem) => {
        setAssignTo(selectedList);
    }

    const onRemoveName = (selectedList, removedItem) => {
        setAssignTo(selectedList);
        console.log(detail);
    }

    /**
     * Toggle between task nav items
     */
    const toggleTaskNav = () => {
        if (forMeNav == 'active') {
            setForMeNav('');
            setCreatedTaskNav('active');
        }
        else {
            setForMeNav('active');
            setCreatedTaskNav('');
        }

    }


    /**
     * Reset Task form
     */
    const resetTaskForm = () => {
        setTitle('');
        setDetail('');
        setPriority('');
        setDueDate('');
        setReminder('');
        setAssignTo('');
    }


    /**
     * Create New Task
     * 
     */
    const createTask = () => {
        setError('');
        if (title === '' || detail === '' || priority === '' || dueDate === '') {
            setError('Found empty fields...');
            return;
        }
        if (assignTo.length === 0) {
            setError("Please select atleast one user");
            return;
        }
        var assign_user = []
        for (let i = 0; i < assignTo.length; i++) {
            assign_user.push(assignTo[i]['username'])
        }
        var remind = null;
        try {
            remind = reminder.toISOString();
        }
        catch {
            remind = null;
        }
        var taskData = {
            "title": title,
            "detail": detail,
            "due_date": dueDate.toISOString(),
            "remainder": remind,
            "priority": priority,
            "assign_to": assign_user
        }

        services.post('/api/task/manage_tasks/', taskData).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                setError('Failed to Fetch')
            }
            else {

                resetTaskForm();
                fetchCreatedTask();
                fetchAssignedTask();
                NotificationManager.success('Success', 'Created New Task');
                setShowNewTask(false);
            }
        })

    }


    /**
     * Fetch created tasks
     */
    function fetchCreatedTask() {
        if (showClosed) {
            var url = '/api/task/all_created_task/';
        }
        else {
            var url = '/api/task/created_tasks/';
        }
        services.get(url).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setCreatedTaskList(res);
            }
        })
    }

    /**
     * Fetch assigned tasks
     */
    function fetchAssignedTask() {
        if (showClosed) {
            var url = '/api/task/all_task_for_me/';
        }
        else {
            var url = '/api/task/manage_tasks/';
        }
        services.get(url).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setAssignedTaskList(res);
            }
        })
    }

    useEffect(() => {
        fetchUserList();
        fetchCreatedTask();
        fetchAssignedTask();
    }, [showClosed,])


    /**
     * Fetch user list
     */
    function fetchUserList() {
        services.get('/api/access_control/all_user/').then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setUserOptions(res);

            }
        })
    }


    const [taskDetail, setTaskDetail] = useState(null);
    const [requireClose, setRequireClose] = useState(false);

    /**
     * Fetch Task details for a specific task
     * @param {*} task_id task ID
     */
    function viewCreatedTaskDetail(task_id) {
        console.log(task_id);
        setNewComment('');
        setShowNewTask(false);
        setShowAssignedTaskDetail(false);
        setShowCretaedTaskDetail(true);
        setTaskDetail(null);
        setRequireClose(false);
        services.get(`/api/task/created_tasks/${task_id}/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setTaskDetail(res);
                fetchComments(task_id);
                res.assign_to.map(user => {
                    if (user.status === "Complete") {
                        setRequireClose(true);
                    }
                })
            }
        })
    }

    const [newComment, setNewComment] = useState('');

    /**
     * Add comment to a specific task
     * @param {*} task_id Task ID
     */
    function addNewComment(task_id) {
        var commentData = {
            'parent_id': '',
            'comment': newComment
        }
        services.post(`/api/task/${task_id}/comment/`, commentData).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setNewComment('');
                NotificationManager.success('Success', 'Added your comment');
                fetchComments(task_id);
            }
        })
    }

    const [commentDetails, setCommentDetails] = useState(null);

    /**
     * Fetch all the comments of a specific task
     * @param {*} task_id  Task ID
     */
    function fetchComments(task_id) {
        services.get(`/api/task/${task_id}/comment/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
                setCommentDetails(null);
            }
            else {
                setCommentDetails(res);
            }
        })
    }

    const [assignedTaskDetail, setAssignedTaskDetail] = useState(null);

    /**
     * View specic assigned task details
     * @param {*} task_id  Task ID
     */
    function viewAssignedTaskDetail(task_id) {
        console.log(task_id);
        setRequireClose(false);
        setNewComment('');
        setShowNewTask(false);
        setShowAssignedTaskDetail(true);
        setShowCretaedTaskDetail(false);
        setAssignedTaskDetail(null);
        services.get(`/api/task/created_tasks/${task_id}/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                setAssignedTaskDetail(res);
                fetchComments(task_id);

            }
        })
    }

    /**
     * Mark one task as completed
     * @param {*} task_id  Task ID
     */
    function markComplete(task_id) {
        var status = {
            'status': 'Complete'
        }
        services.post(`/api/task/${task_id}/change_status/`, status).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                NotificationManager.success('Success', 'Marked as completed');
                viewAssignedTaskDetail(task_id);
            }
        })
    }

    /**
     * Mark one task as closed
     * @param {*} task_id  Task ID
     */
    function markClose(task_id) {
        services.post(`/api/task/${task_id}/mark_close/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                NotificationManager.success('Success', 'Task Closed');
                //viewAssignedTaskDetail(task_id);
                setShowNewTask(false);
                setShowCretaedTaskDetail(false);
                setShowAssignedTaskDetail(false);
                fetchCreatedTask();
                fetchAssignedTask();
            }
        })
    }


    /**
     * Delete a specific task
     * @param {*} task_id  Task ID
     */
    function deleteTask(task_id) {
        services.delete(`/api/task/${task_id}/delete/`).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                NotificationManager.success('Success', 'Task Closed');
                //viewAssignedTaskDetail(task_id);
                setShowNewTask(false);
                setShowCretaedTaskDetail(false);
                setShowAssignedTaskDetail(false);
                fetchCreatedTask();
                fetchAssignedTask();
            }
        })
    }

    /**
     * Reopen a closed task
     * @param {*} task_id  Task ID
     */
    function reopenTask(task_id) {
        services.post(`/api/task/${task_id}/reopen/`, {}).then(res => {
            console.log(res);
            if (res == 'TypeError: Failed to fetch') {
                console.log("failed to fetch user");
            }
            else {
                NotificationManager.success('Success', 'Task Closed');
                //viewAssignedTaskDetail(task_id);
                setShowNewTask(false);
                setShowCretaedTaskDetail(false);
                setShowAssignedTaskDetail(false);
                fetchCreatedTask();
                fetchAssignedTask();
            }
        })
    }

    return (
        <div className="dashboard-body">
            <Header />
            <NavBar />
            <NotificationContainer />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-5">
                        <div className="my-call">
                            <div className="my-calls-column">
                                <div className="calls-top-pannel">
                                    <div className="row">
                                        <div className="col-md-12" style={{ height: "700px" }}>
                                            <div className="pannel-heading clearfix">

                                                <div className="col-md-6">
                                                    <div className="pannel-heading-icon"><i className="fa fa-tasks" aria-hidden="true"></i></div>
                                                    <div className="pannel-heading-info">
                                                        <h3>Tasks </h3>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="pannel-nav clearfix">
                                                        <ul className="clearfix">
                                                            <li><a onClick={() => { setError(''); setShowNewTask(true); setShowCretaedTaskDetail(false); setShowAssignedTaskDetail(false); }}>New Task</a></li>
                                                        </ul>

                                                    </div>
                                                </div>

                                            </div>
                                            <div className="tasks-review-list">
                                                <div className="view-list">
                                                    <ul class="nav nav-tabs">
                                                        <li role="presentation" class={forMeNav}><a style={{ fontSize: "16px" }} onClick={toggleTaskNav}>Self</a></li>
                                                        <li role="presentation" class={createdTaskNav}><a style={{ fontSize: "16px" }} onClick={toggleTaskNav}>Assigned</a></li>
                                                        <div style={{ paddingRight: "20px" }}>
                                                            <label class="switch pull-right">

                                                                <input type="checkbox" onChange={() => { console.log(showClosed); setShowClosed(!showClosed); console.log(showClosed); }} />
                                                                <span class="slider round"></span>
                                                            </label>
                                                            <label className="pull-right">Show Closed &nbsp;</label>

                                                        </div>
                                                    </ul>
                                                    <ul className="clearfix pull-right" style={{ paddingTop: "20px" }}>

                                                    </ul>
                                                </div>
                                            </div>
                                            {
                                                forMeNav === 'active' &&
                                                <div>
                                                    <div className="call-table" style={{ height: "600px" }}>
                                                        <table className="ss">
                                                            <thead>
                                                                <tr>
                                                                    <th>
                                                                        <p>
                                                                            Task
                                                                        </p>
                                                                    </th>
                                                                    <th>
                                                                        <p></p>
                                                                    </th>
                                                                    <th>
                                                                        <p>Priority</p>
                                                                    </th>
                                                                    <th>
                                                                        <p>Assigned By</p>

                                                                    </th>
                                                                    <th>
                                                                        <p>Due Date</p>

                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    assignedTaskList &&
                                                                    assignedTaskList.map(task => (
                                                                        <tr className="tableRow" onClick={() => viewAssignedTaskDetail(task.id)}>
                                                                            <td colSpan="2">
                                                                                {
                                                                                    task.closed ? <i style={{ color: "#5AB5BF" }} className="fa fa-low-vision" aria-hidden="true"></i> : ""
                                                                                }
                                                                                {task.title}
                                                                            </td>
                                                                            <td>{task.priority}</td>
                                                                            <td>{task.created_by__first_name}&nbsp;{task.created_by__last_name}</td>
                                                                            <td>{task.creation_date.substring(0, 10)}</td>
                                                                        </tr>
                                                                    ))
                                                                }

                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            }

                                            {
                                                createdTaskNav === 'active' &&
                                                <div>
                                                    <div className="call-table" style={{ height: "600px" }}>
                                                        <table className="ss">
                                                            <thead>
                                                                <tr>
                                                                    <th>
                                                                        <p>
                                                                            Task
                                                                        </p>
                                                                    </th>
                                                                    <th>
                                                                        <p></p>
                                                                    </th>
                                                                    <th>
                                                                        <p>Due Date</p>
                                                                    </th>
                                                                    <th>
                                                                        <p>Assigned To</p>

                                                                    </th>
                                                                    <th>
                                                                        <p>Status</p>

                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    createdTaskList &&
                                                                    createdTaskList.map(task => (
                                                                        <tr className="tableRow" onClick={() => viewCreatedTaskDetail(task.id)}>
                                                                            <td colSpan="2">
                                                                                {
                                                                                    task.closed ? <i style={{ color: "#5AB5BF" }} className="fa fa-low-vision" aria-hidden="true"></i> : ""
                                                                                }
                                                                                {task.title}
                                                                            </td>
                                                                            <td>{task.creation_date.substring(0, 10)}</td>
                                                                            <td colSpan="2">
                                                                                {
                                                                                    task.assign_to &&
                                                                                    task.assign_to.map(user => (
                                                                                        <tr>
                                                                                            <td style={{ padding: "1px 1px" }}>{user.user.first_name} &nbsp;{user.user.last_name}</td>
                                                                                            <td style={{ padding: "1px 1px" }}>{user.status}</td>
                                                                                        </tr>
                                                                                    ))

                                                                                }
                                                                            </td>

                                                                        </tr>
                                                                    ))
                                                                }

                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {
                        showNewTask &&

                        <div className="col-lg-7">
                            <div className="my-call">
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-md-12" style={{ height: "700px" }}>
                                                <div className="pannel-heading clearfix">
                                                    <div className="pannel-heading-info">
                                                        <h3>New Task </h3>
                                                    </div>
                                                </div>


                                                <div className="my-calls-form">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-col clearfix">

                                                                <label>Title </label><br />
                                                                <input type="text" placeholder="Enter task title..." value={title} onChange={(e) => setTitle(e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <div className="form-col clearfix">

                                                                <label>Details </label><br />
                                                                <textarea style={{ height: "150px" }} rows="5" cols="50" onChange={(e) => setDetail(e.target.value)}>{detail}</textarea>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-col clearfix">

                                                                <label>Priority </label><br />
                                                                <select onChange={(e) => setPriority(e.target.value)}>
                                                                    <option></option>
                                                                    <option>Normal</option>
                                                                    <option>High</option>
                                                                    <option>Low</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="form-col clearfix">

                                                                <label>Due Date </label><br />
                                                                <Datetime
                                                                    onChange={setDueDate}
                                                                    value={dueDate}
                                                                    dateFormat='YYYY-MM-DD'

                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="form-col clearfix">

                                                                <label>Assign To </label><br />
                                                                <Multiselect
                                                                    options={userOptions}
                                                                    displayValue="username"
                                                                    onSelect={onSelectName}
                                                                    onRemove={onRemoveName}
                                                                    selectedValues={assignTo}
                                                                    style={{
      
                                                                        searchBox: {
                                                                          border: 'none',
                                                                          'border-bottom': 'none',
                                                                          'border-radius': '0px'
                                                                        }
                                                                       
                                                                      }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="form-col clearfix">

                                                                <label>Reminder </label><br />
                                                                <Datetime
                                                                    onChange={setReminder}
                                                                    value={reminder}
                                                                    dateFormat='YYYY-MM-DD'

                                                                />
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <div className="popup-footer">

                                                        <>
                                                            <button className="btn Save" type="button" onClick={createTask} > Create  </button>
                                                        </>

                                                    </div>

                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <p className="errorColor">{error}</p>
                                                        </div>
                                                    </div>
                                                </div>




                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }


                    {
                        showCretaedTaskDetail &&
                        <div className="col-lg-7">
                            <div className="my-call">
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-md-12" style={{ minHeight: "700px" }}>
                                                <div className="pannel-heading clearfix">
                                                    <div className="pannel-heading-info">
                                                        <h3>Task <i className="fa fa-upload" aria-hidden="true"></i> </h3>
                                                    </div>
                                                    <div>
                                                        {showCretaedTaskDetail &&
                                                            <div className="pannel-nav clearfix">
                                                                <ul className="clearfix">
                                                                    {
                                                                        taskDetail && (
                                                                            taskDetail.closed ?
                                                                                <li><a onClick={() => { reopenTask(assignedTaskDetail.id) }}>ReOpen</a></li>
                                                                                :
                                                                                <>
                                                                                    {
                                                                                        requireClose === false &&
                                                                                        <li><a onClick={() => { deleteTask(assignedTaskDetail.id) }}>Delete</a></li>
                                                                                    }
                                                                                    {
                                                                                        requireClose === true &&
                                                                                        <li><a onClick={() => { markClose(assignedTaskDetail.id) }}>Close</a></li>
                                                                                    }
                                                                                </>
                                                                        )
                                                                    }
                                                                </ul>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>


                                                {taskDetail && <>
                                                    <div className="row" style={{ padding: "20px" }}>
                                                        <div className="col-md-6">
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                    <label>Title</label>
                                                                </div>
                                                                <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <p>{taskDetail.title}</p>
                                                                </div>
                                                            </div>
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                    <label>Details</label>
                                                                </div>
                                                                <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <p>{taskDetail.detail}</p>
                                                                </div>
                                                            </div>
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                    <label>Priority</label>
                                                                </div>
                                                                <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <p>{taskDetail.priority}</p>
                                                                </div>
                                                            </div>
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                    <label>Due Date</label>
                                                                </div>
                                                                <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <p>{taskDetail.due_date}</p>
                                                                </div>
                                                            </div>
                                                            {taskDetail.remainder ? <>
                                                                <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                    <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                        <label>Reminder</label>
                                                                    </div>
                                                                    <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                        <p>{taskDetail.remainder}</p>
                                                                    </div>
                                                                </div>
                                                            </> : ''}
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-6" style={{ textAlign: "center", minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <label>Assigned To</label>
                                                                </div>
                                                                <div class="col-sm-6" style={{ textAlign: "center", minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <label>Current Status</label>
                                                                </div>
                                                            </div>

                                                            {
                                                                taskDetail &&
                                                                taskDetail.assign_to.map(user => (
                                                                    <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                        <div class="col-sm-6" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                            <p>{user.user.first_name}&nbsp;{user.user.last_name}</p>
                                                                        </div>
                                                                        <div class="col-sm-6" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                            <p>{user.status}</p>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>

                                                    </div>

                                                    <div className="row" style={{ padding: "20px" }}>
                                                        <div className="pannel-heading clearfix">
                                                            <div className="pannel-heading-info">
                                                                <h3>Comment Section </h3>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="form-col clearfix" style={{ paddingLeft: "0px", paddingRight: "0px" }}>


                                                                <div className="col-md-11">
                                                                    <input style={{ fontSize: "15px" }} type="text" placeholder="Add New Comments.." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                                                </div>

                                                                <div className="col-md-1">
                                                                    <div className="sendButton" onClick={() => addNewComment(taskDetail.id)}>
                                                                        <i style={{ transform: "rotate(50deg)" }} className="fa fa-paper-plane" aria-hidden="true"></i>
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            {
                                                                commentDetails &&
                                                                commentDetails.map(comment => (
                                                                    <div class="row" style={{
                                                                        paddingLeft: "30px",
                                                                        paddingRight: "120px",
                                                                        paddingTop: "10px",
                                                                        background: "#FDFAFF",
                                                                        marginTop: "5px",
                                                                        marginBottom: "5px",
                                                                        marginLeft: "25px",
                                                                        marginRight: "25px"
                                                                    }}>
                                                                        <div className="pannel-heading-icon" style={{ background: "white" }}>
                                                                            <i style={{ color: "#403EA8", fontSize: "35px" }} className="fa fa-user-circle-o" aria-hidden="true"></i>
                                                                        </div>

                                                                        <a style={{ fontSize: "18px", color: "#645F68" }}>{comment.comment_by_.first_name}&nbsp;{comment.comment_by_.last_name}</a>
                                                                        <br />
                                                                        <h6 style={{ color: "#9B9A9C" }}>{comment.date.substring(0, 10)}</h6>
                                                                        <div className="row">
                                                                            <a style={{ fontSize: "15px" }}>{comment.comment}</a>
                                                                        </div>
                                                                        <br />
                                                                    </div>
                                                                ))
                                                            }

                                                        </div>

                                                    </div>
                                                </>
                                                }


                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    }

                    {
                        showAssignedTaskDetail &&
                        <div className="col-lg-7">
                            <div className="my-call">
                                <div className="my-calls-column">
                                    <div className="calls-top-pannel">
                                        <div className="row">
                                            <div className="col-md-12" style={{ minHeight: "700px" }}>
                                                <div className="pannel-heading clearfix">
                                                    <div className="pannel-heading-info">
                                                        <h3>Task <i class="fa fa-download" aria-hidden="true"></i></h3>
                                                    </div>

                                                    <div>
                                                        {assignedTaskDetail &&
                                                            <div className="pannel-nav clearfix">
                                                                <ul className="clearfix">
                                                                    {
                                                                        assignedTaskDetail &&
                                                                        assignedTaskDetail.assign_to.map(user => (

                                                                            localStorage.getItem('username') === user.user.username ?
                                                                                user.status == "Assigned" &&
                                                                                <li><a onClick={() => { markComplete(assignedTaskDetail.id) }}>Mark Complete</a></li>

                                                                                : ""
                                                                        ))
                                                                    }
                                                                </ul>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>


                                                {assignedTaskDetail && <>
                                                    <div className="row" style={{ padding: "20px" }}>
                                                        <div className="col-md-6">
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                    <label>Title</label>
                                                                </div>
                                                                <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <p>{assignedTaskDetail.title}</p>
                                                                </div>
                                                            </div>
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                    <label>Details</label>
                                                                </div>
                                                                <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <p>{assignedTaskDetail.detail}</p>
                                                                </div>
                                                            </div>
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                    <label>Priority</label>
                                                                </div>
                                                                <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <p>{assignedTaskDetail.priority}</p>
                                                                </div>
                                                            </div>
                                                            <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                    <label>Due Date</label>
                                                                </div>
                                                                <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                    <p>{assignedTaskDetail.due_date}</p>
                                                                </div>
                                                            </div>
                                                            {assignedTaskDetail.remainder ? <>
                                                                <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                    <div class="col-sm-4" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                        <label>Reminder</label>
                                                                    </div>
                                                                    <div class="col-sm-8" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px", background: "#D8D5FF" }}>
                                                                        <p>{assignedTaskDetail.remainder}</p>
                                                                    </div>
                                                                </div>
                                                            </> : ''}
                                                        </div>

                                                        <div className="col-md-6">

                                                            {
                                                                assignedTaskDetail &&
                                                                assignedTaskDetail.assign_to.map(user => (

                                                                    localStorage.getItem('username') === user.user.username ?

                                                                        <div className="row" style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                                                                            <div class="col-sm-6" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                                <p>Current Status</p>
                                                                            </div>
                                                                            <div class="col-sm-6" style={{ minHeight: "30px", borderStyle: "ridge", borderWidth: "1px" }}>
                                                                                <p><b>{user.status}</b></p>
                                                                            </div>
                                                                        </div> : ""
                                                                ))
                                                            }

                                                        </div>

                                                    </div>

                                                    <div className="row" style={{ padding: "20px" }}>
                                                        <div className="pannel-heading clearfix">
                                                            <div className="pannel-heading-info">
                                                                <h3>Comment Section </h3>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="form-col clearfix" style={{ paddingLeft: "0px", paddingRight: "0px" }}>


                                                                <div className="col-md-11">
                                                                    <input style={{ fontSize: "15px" }} type="text" placeholder="Add New Comments.." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                                                                </div>

                                                                <div className="col-md-1">
                                                                    <div className="sendButton" onClick={() => addNewComment(taskDetail.id)}>
                                                                        <i style={{ transform: "rotate(50deg)" }} className="fa fa-paper-plane" aria-hidden="true"></i>
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            {
                                                                commentDetails &&
                                                                commentDetails.map(comment => (
                                                                    <div class="row" style={{
                                                                        paddingLeft: "30px",
                                                                        paddingRight: "120px",
                                                                        paddingTop: "10px",
                                                                        background: "#FDFAFF",
                                                                        marginTop: "5px",
                                                                        marginBottom: "5px",
                                                                        marginLeft: "25px",
                                                                        marginRight: "25px"
                                                                    }}>
                                                                        <div className="pannel-heading-icon" style={{ background: "white" }}>
                                                                            <i style={{ color: "#403EA8", fontSize: "35px" }} className="fa fa-user-circle-o" aria-hidden="true"></i>
                                                                        </div>

                                                                        <a style={{ fontSize: "18px", color: "#645F68" }}>{comment.comment_by_.first_name}&nbsp;{comment.comment_by_.last_name}</a>
                                                                        <br />
                                                                        <h6 style={{ color: "#9B9A9C" }}>{comment.date.substring(0, 10)}</h6>
                                                                        <div className="row">
                                                                            <a style={{ fontSize: "15px" }}>{comment.comment}</a>
                                                                        </div>
                                                                        <br />
                                                                    </div>
                                                                ))
                                                            }

                                                        </div>

                                                    </div>
                                                </>
                                                }


                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    }
                </div>
            </div>

            <Footer />
        </div >
    );
}

export default Task;