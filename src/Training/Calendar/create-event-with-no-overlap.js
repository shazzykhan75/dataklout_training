import React, { useCallback, useState, useMemo, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Calendar, Views, DateLocalizer } from 'react-big-calendar'
// import DemoLink from './DemoLink.component'
import events from './events'
// import 'react-big-calendar/lib/sass/styles';
import Form from './../Form';
import { useHistory } from "react-router-dom";
export default function CreateEventWithNoOverlap({
    localizer,
    dayLayoutAlgorithm = 'no-overlap',
}) {
    const [myEvents, setEvents] = useState(events)
    const history = useHistory();
    const handleSelectSlot = useCallback(
        ({ start, end }) => {
            history.push('/Training/Form')
           
        },
        [setEvents]
    )
   
   
    

    const { defaultDate, scrollToTime } = useMemo(
        () => ({
            defaultDate: new Date(),
            scrollToTime: new Date(1970, 1, 1, 6),
        }),
        []
    )

    return (
        <Fragment>
            <div className="height 600">
                <Calendar
                    dayLayoutAlgorithm={dayLayoutAlgorithm}
                    defaultDate={defaultDate}
                    defaultView={Views.MONTH}
                    events={myEvents}
                    localizer={localizer}
                //   onDoubleClickEvent={}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    scrollToTime={scrollToTime}
                    style={{ height: 500 }}
                    
                />
            </div>
        </Fragment>
    )
}

CreateEventWithNoOverlap.propTypes = {
    localizer: PropTypes.instanceOf(DateLocalizer),
    dayLayoutAlgorithm: PropTypes.string,
}