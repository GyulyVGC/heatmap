import './App.css';
import { useState } from "react";
import Map from "./Map";
import MySlider from './Slider';
import BasicSelect from './RangeSelector';
import Form from 'react-bootstrap/Form';
import { Moment } from 'moment';

const moment = require('moment');


function App() {
  const [timeLowerValue, setTimeLowerValue] = useState(moment("2023-02-23T06:00:00", 'YYYY-MM-DD hh:mm:ss'));
  const updateTimeLowerValue = (timeLowerValue: Moment) => {
    setTimeLowerValue(timeLowerValue);
  }
  const [opacityVal, setOpacityVal] = useState(50);
  const updateOpacityVal = (sliderVal: number) => {
    setOpacityVal(sliderVal);
  }
  const [delta, setDelta] = useState(60);
  const updateDelta = (delta: number) => {
    setDelta(delta);
  }
  const [date, setDate] = useState(moment("2023-02-23", 'YYYY-MM-DD'));
  const updateDate = (date: Moment) => {
    setDate(date);
  }
  const [fullRange, setFullRange] = useState({
    startMoment: moment("2023-02-23T06:00:00", 'YYYY-MM-DD hh:mm:ss'),
    endMoment: moment("2023-02-23T10:00:00", 'YYYY-MM-DD hh:mm:ss')
  });
  const updateFullRange = (fullRange: { startMoment: Moment, endMoment: Moment }) => {
    setFullRange(fullRange);
  }

  let rangeRadioButtons = [];
  for (let r of [1, 2, 4, 8]) {
    rangeRadioButtons.push(
      <Form.Check
        inline
        defaultChecked={r === 4}
        label={r}
        name="group2"
        type='radio'
        id='inline-radio-2'
        onClick={() => setFullRange(fullRange)}
      />
    );
  }


  return (<div className='App'>
    <Map timeLowerValue={timeLowerValue}
      opacityVal={opacityVal} setOpacityVal={updateOpacityVal}
      delta={delta} setDelta={updateDelta} />
    <MySlider date={date} setDate={updateDate} timeLowerValue={timeLowerValue} setTimeLowerValue={updateTimeLowerValue} fullRange={fullRange} delta={delta} setDelta={updateDelta} />
    <BasicSelect/>
    <div style={{ textAlign: 'center', paddingTop: 10 }}>
      Range (hours)
    </div>
    <div style={{ textAlign: 'center' }}>
      <div className="form-check-inline" style={{ margin: 'auto', paddingTop: 10 }}>
        {rangeRadioButtons}
      </div>
    </div>

  </div>);
}

export default App;
