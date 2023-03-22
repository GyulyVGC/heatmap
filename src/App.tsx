import './App.css';
import { useState } from "react";
import LeafletMap from "./LeafletMap";
import NetworkData from "./NetworkData";
import MySlider from './Slider';
import BasicSelect from './RangeSelector';
import Form from 'react-bootstrap/Form';
import { Moment } from 'moment';
import { Row, Col } from 'react-bootstrap';

const moment = require('moment');


function App() {
  const [timeLowerValue, setTimeLowerValue] = useState(moment("2023-02-23T06:00:00", 'YYYY-MM-DD hh:mm:ss'));
  const updateTimeLowerValue = (timeLowerValue: Moment) => {
    setTimeLowerValue(timeLowerValue);
  }
  const [timeUpperValue, setTimeUpperValue] = useState(moment("2023-02-23T07:00:00", 'YYYY-MM-DD hh:mm:ss'));
  const updateTimeUpperValue = (timeUpperValue: Moment) => {
    setTimeUpperValue(timeUpperValue);
  }
  const [opacityVal, setOpacityVal] = useState(50);
  const updateOpacityVal = (sliderVal: number) => {
    setOpacityVal(sliderVal);
  }

  const [date, setDate] = useState(moment("2023-02-23", 'YYYY-MM-DD'));
  const updateDate = (date: Moment) => {
    setDate(date);
  }
  const [fullRange, setFullRange] = useState({
    startMoment: moment("2023-02-23T06:00:00", 'YYYY-MM-DD HH:mm:ss'),
    endMoment: moment("2023-02-23T10:00:00", 'YYYY-MM-DD HH:mm:ss')
  });
  const updateFullRange = (fullRange: { startMoment: Moment, endMoment: Moment }) => {
    setFullRange(fullRange);
  }
  const [showTargets, setShowTargets] = useState([true, false]);
  const updateShowTargets = (showTargets: boolean[]) => {
    setShowTargets(showTargets);
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
    <Row style={{ width: "100%", margin: 'auto' }}>
      <Col className='col-6' style={{paddingRight: 0}}>
        <LeafletMap timeLowerValue={timeLowerValue}
          opacityVal={opacityVal} setOpacityVal={updateOpacityVal}
          showTargets={showTargets}
          setShowTargets={updateShowTargets}
          fullRange={fullRange}
          timeUpperValue={timeUpperValue} />
      </Col>
      <Col className='col-6' style={{paddingLeft: 0}}>
        <NetworkData />
      </Col>
    </Row>
    <MySlider date={date} setDate={updateDate} timeLowerValue={timeLowerValue} setTimeLowerValue={updateTimeLowerValue}
      timeUpperValue={timeUpperValue} setTimeUpperValue={updateTimeUpperValue}
      fullRange={fullRange} setFullRange={updateFullRange} />

  </div>);
}

export default App;
