import moment from 'moment'
import {  momentLocalizer } from 'react-big-calendar'
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../App.css";
import CreateEventWithNoOverlap from "./Calendar/create-event-with-no-overlap";

const locales = {
    "en-IN": require("date-fns/locale/en-IN"),
};
// const localizer = dateFnsLocalizer({
//     format,
//     parse,
//     startOfWeek,
//     getDay,
//     locales,
// });

// const events = [
//     {
//         title: "Big Meeting",
//         allDay: true,
//         start: new Date(2021, 6, 0),
//         end: new Date(2021, 6, 0),
//     },
//     {
//         title: "Vacation",
//         start: new Date(2021, 6, 7),
//         end: new Date(2021, 6, 10),
//     },
//     {
//         title: "Conference",
//         start: new Date(2022, 9, 29),
//         end: new Date(2022, 9, 30),
//     },
// ];
const localizer = momentLocalizer(moment)


function Calender() {
    // const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });
    // const [allEvents, setAllEvents] = useState('');

    // function handleAddEvent() {
    //     setAllEvents([...allEvents, newEvent]);
    // }
   

    return (
        <div className="App">
           
            <div>
                {/* <input type="text" placeholder="Add Title" style={{ width: "20%", marginRight: "10px" }} value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <DatePicker placeholderText="Start Date" style={{ marginRight: "10px" }} selected={newEvent.start} onChange={(start) => setNewEvent({ ...newEvent, start })} />
                <DatePicker placeholderText="End Date" selected={newEvent.end} onChange={(end) => setNewEvent({ ...newEvent, end })} />
                <button stlye={{ marginTop: "10px" }} onClick={handleAddEvent}>
                    Add Event
                </button> */}
                {/* <CreateEventWithNoOverlap/> */}
                <CreateEventWithNoOverlap localizer={localizer} />
            </div>
            

            
        </div>
    );
}

export default Calender;