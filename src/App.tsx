import './App.css';
import { useState } from "react";
import Map from "./Map";


function App() {
  const [sliderVal, setSliderVal] = useState(0);
  const updateSliderVal = (sliderVal: number) => {
    setSliderVal(sliderVal);
  }
  const [opacityVal, setOpacityVal] = useState(50);
  const updateOpacityVal = (sliderVal: number) => {
    setOpacityVal(sliderVal);
  }
  const [delta, setDelta] = useState(5);
  const updateDelta = (delta: number) => {
    setDelta(delta);
  }

  return (<>
    <Map sliderVal={sliderVal} setSliderVal={updateSliderVal}
      opacityVal={opacityVal} setOpacityVal={updateOpacityVal}
      delta={delta} setDelta={updateDelta} />
  </>);
}

export default App;
