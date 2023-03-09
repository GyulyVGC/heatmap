import './App.css';
import { useState } from "react";
import Map from "./Map";
import MySlider from './Slider';
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
  const [fullRange, setFullRange] = useState({
    startMoment: moment("2023-02-23T06:00:00", 'YYYY-MM-DD hh:mm:ss'),
    endMoment: moment("2023-02-23T14:00:00", 'YYYY-MM-DD hh:mm:ss')
  });
  const updateFullRange = (fullRange: { startMoment: Moment, endMoment: Moment }) => {
    setFullRange(fullRange);
  }

  let deltaRadioButtons = [];
  for (let d of [10, 30, 60, 120]) {
    deltaRadioButtons.push(
      <Form.Check
        inline
        defaultChecked={d === delta}
        label={d}
        name="group1"
        type='radio'
        id='inline-radio-1'
        onClick={() => setDelta(d)}
      />
    );
  }

  let rangeRadioButtons = [];
  for (let range of [1, 2, 4, 8]) {
    rangeRadioButtons.push(
      <Form.Check
        inline
        defaultChecked={range === 8}
        label={range}
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
    <MySlider timeLowerValue={timeLowerValue} setTimeLowerValue={updateTimeLowerValue} fullRange={fullRange} delta={delta} />
    <div style={{ textAlign: 'center', paddingTop: 10 }}>
      Delta (minutes)
    </div>
    <div style={{ textAlign: 'center' }}>
      <div className="form-check-inline" style={{ margin: 'auto', paddingTop: 10 }}>
        {deltaRadioButtons}
      </div>
    </div>
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
