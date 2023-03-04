import './App.css';
import L, { LatLng } from 'leaflet';
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import ReactSlider from 'react-slider';

var map: L.Map;
var allPoints: LatLng[] = [];
var heatLayer: L.Layer;

function App() {
  const [sliderVal, setSliderVal] = useState(0);
  const updateSliderVal = (sliderVal: number) => {
    setSliderVal(sliderVal);
  }
  const [opacityVal, setOpacityVal] = useState(50);
  const updateOpacityVal = (sliderVal: number) => {
    setOpacityVal(sliderVal);
  }
  const [delta, setDelta] = useState(50);
  const updateDelta = (delta: number) => {
    setDelta(delta);
  }

  return (<>
    <Map sliderVal={sliderVal} setSliderVal={updateSliderVal}
      opacityVal={opacityVal} setOpacityVal={updateOpacityVal}
      delta={delta} setDelta={updateDelta} />
  </>);
}

function Map(props: {
  sliderVal: number,
  setSliderVal: (sliderVal: number) => void,
  opacityVal: number,
  setOpacityVal: (opacityVal: number) => void,
  delta: number,
  setDelta: (delta: number) => void
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      let config = {
        minZoom: 1,
        maxZoom: 23,
      };
      const zoom = 9;

      let lat = 45.3;
      let long = 8.0;

      map = L.map("map", config).setView([lat, long], zoom);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      fetch('./andata.json')
        .then((response) => response.json())
        .then((json) => {
          for (let i = 0; i < json.length; i++) {
            let pointLat: number = json[i].lat;
            let pointLong: number = json[i].lng;
            let latLng_object = new L.LatLng(pointLat, pointLong);
            allPoints.push(
              latLng_object
            )
          }
        });
    } else {
      let currentPoints: LatLng[] = [];
      let delta = props.delta;
      const min: number = allPoints.length * props.sliderVal / 100 - delta > 0 ?
        Math.round(allPoints.length * props.sliderVal / 100 - delta) : 0;
      const max: number = allPoints.length * props.sliderVal / 100 + delta < allPoints.length ?
        Math.round(allPoints.length * props.sliderVal / 100 + delta) : allPoints.length;
      for (let i = min; i < max; i++) {
        let pointLat: number = allPoints[i].lat;
        let pointLong: number = allPoints[i].lng;
        let latLng_object = new L.LatLng(pointLat, pointLong);
        currentPoints.push(
          latLng_object
        )
      }
      let center = getCentralPoint(currentPoints);
      map.panTo(center);
      if (heatLayer !== undefined && heatLayer !== null) {
        map.removeLayer(heatLayer);
      }
      heatLayer = L.heatLayer(currentPoints, { radius: 10, minOpacity: props.opacityVal / 100, blur: 5 }).addTo(map);
    }
  }, [props.sliderVal, props.opacityVal, props.delta, isInitialized]);

  return (<>
    <div id="map" style={{ height: "70vh" }}></div>
    <div>
      <ReactSlider defaultValue={0}
        className="horizontal-slider"
        thumbClassName="example-thumb"
        trackClassName="example-track"
        onChange={(value: number) => props.setSliderVal(value)} />
    </div>
    <div>
      <ReactSlider defaultValue={50}
        className="horizontal-slider"
        thumbClassName="example-thumb"
        trackClassName="example-track"
        onChange={(value: number) => props.setOpacityVal(value)} />
    </div>
    <div>
      <ReactSlider defaultValue={10}
        className="horizontal-slider"
        thumbClassName="example-thumb"
        trackClassName="example-track"
        onChange={(value: number) => props.setDelta(value)} />
    </div>
  </>
  );
}

function getCentralPoint(points: LatLng[]): LatLng {
  let minLat = 90;
  let minLng = 180;
  let maxLat = -90;
  let maxLng = -180;
  for (let point of points) {
    if (point.lat < minLat) {
      minLat = point.lat;
    }
    if (point.lng < minLng) {
      minLng = point.lng;
    }
    if (point.lat > maxLat) {
      maxLat = point.lat;
    }
    if (point.lng > maxLng) {
      maxLng = point.lng;
    }
  }
  let centralLat = (minLat + maxLat) / 2;
  let centralLng = (minLng + maxLng) / 2;
  return new LatLng(centralLat, centralLng);
}

export default App;
