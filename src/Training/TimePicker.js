import React, { useState } from "react";
import TimePicker from "rc-time-picker";
import 'rc-time-picker/assets/index.css';
 
function TimeDropDown() {
  const [time, setTime] = useState('');
  return (
    <div className="App">
     
      <TimePicker
        placeholder="Select Time"
        use12Hours
        showSecond={false}
        focusOnOpen={true}
        format="hh:mm A"
        onChange={e => setTime(e.format('LT'))}
      />
    </div>
  );
}
 
export default TimeDropDown;