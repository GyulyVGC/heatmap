import ReactSlider from 'react-slider';
import L, { LatLng } from 'leaflet';
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Moment } from 'moment';

var map: L.Map;
var allPoints: { position: LatLng, timestamp: string }[] = [];
var heatLayer: L.Layer;
const moment = require('moment');

const config = {
    minZoom: 1,
    maxZoom: 23,
};
const initZoom = 9;

const initLat = 45.3;
const initLong = 8.0;

function Map(props: {
    sliderVal: number,
    setSliderVal: (sliderVal: number) => void,
    opacityVal: number,
    setOpacityVal: (opacityVal: number) => void,
    delta: number,
    setDelta: (delta: number) => void
}) {
    const [isInitialized, setIsInitialized] = useState(false);
    const updateIsInitialized = (isInitialized: boolean) => {
        setIsInitialized(isInitialized);
    }
    useEffect(() => {
        if (!isInitialized) {
            initializeMap(updateIsInitialized);
        } else {
            updateMap(props.sliderVal, props.opacityVal, props.delta);
        }
    }, [props.sliderVal, props.opacityVal, props.delta, isInitialized]);

    return (
        <>
            <div id="map" style={{ height: "70vh", width: "80%", margin: 'auto' }}></div>
            {
                isInitialized ?
                    <div style={{ textAlign: 'center', paddingTop: 10 }}>
                        Time: from {allPoints[getLowerBound(props.sliderVal)].timestamp}
                        &nbsp;to {allPoints[getUpperBound(props.sliderVal, props.delta)].timestamp}
                    </div> : null
            }
            <ReactSlider defaultValue={0}
                className="horizontal-slider"
                thumbClassName="example-thumb"
                trackClassName="example-track"
                onChange={(value: number) => props.setSliderVal(value)} />
            <div style={{ textAlign: 'center', paddingTop: 10 }}>
                Range (minutes)
            </div>
            <div style={{ textAlign: 'center' }}>
                <div className="form-check-inline" style={{ margin: 'auto', paddingTop: 10 }}>
                    <Form.Check
                        inline
                        label="1"
                        name="group1"
                        type='radio'
                        id='inline-radio-1'
                        onClick={() => props.setDelta(1)}
                    />
                    <Form.Check
                        inline
                        label="5"
                        defaultChecked
                        name="group1"
                        type='radio'
                        id='inline-radio-2'
                        onClick={() => props.setDelta(5)}
                    />
                    <Form.Check
                        inline
                        label="30"
                        name="group1"
                        type='radio'
                        id='inline-radio-3'
                        onClick={() => props.setDelta(30)}
                    />
                    <Form.Check
                        inline
                        label="60"
                        name="group1"
                        type='radio'
                        id='inline-radio-4'
                        onClick={() => props.setDelta(60)}
                    />
                </div>
            </div>
            <div style={{ textAlign: 'center', paddingTop: 10 }}>
                Opacity ({props.opacityVal})
            </div>
            <ReactSlider defaultValue={50}
                className="horizontal-slider"
                thumbClassName="example-thumb"
                trackClassName="example-track"
                onChange={(value: number) => props.setOpacityVal(value)} />
        </>
    );
}

function initializeMap(setIsInitialized: (isInitialized: boolean) => void) {
    map = L.map("map", config).setView([initLat, initLong], initZoom);

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
                let timestamp: string = json[i].time;
                let displayTimestamp = timestamp.substring(0, 19);
                let latLng_object = new L.LatLng(pointLat, pointLong);
                allPoints.push({
                    position: latLng_object,
                    timestamp: displayTimestamp
                }
                )
            }
            setIsInitialized(true);
        });
}

function updateMap(sliderVal: number, opacityVal: number, delta: number) {
    let currentPoints: LatLng[] = [];
    const min: number = getLowerBound(sliderVal);
    const max: number = getUpperBound(sliderVal, delta);
    for (let i = min; i <= max; i++) {
        let pointLat: number = allPoints[i].position.lat;
        let pointLong: number = allPoints[i].position.lng;
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
    heatLayer = L.heatLayer(currentPoints, { radius: 10, minOpacity: opacityVal / 100, blur: 5 }).addTo(map);
}

// returns an index of the allPoints array
function getLowerBound(sliderVal: number): number {
    let lowerBoundIndex = Math.round(allPoints.length * sliderVal / 100);
    return lowerBoundIndex < allPoints.length ? lowerBoundIndex : allPoints.length - 1;
}

// returns an index of the allPoints array
function getUpperBound(sliderVal: number, delta: number): number {
    // get lower bound element and parse its timestamp
    // start scanning from lower bound until timestamp < lower_bound_timestamp + delta
    let lowerBoundIndex: number = getLowerBound(sliderVal);
    let lowerBoundTimestamp: string = allPoints[lowerBoundIndex].timestamp;
    let lowerBoundMoment: Moment = moment(lowerBoundTimestamp, 'YYYY-MM-DD hh:mm:ss');
    let upperBoundMoment: Moment = lowerBoundMoment.add(delta, "minutes");
    let upperBoundIndex: number = allPoints.length - 1;
    for(let i = lowerBoundIndex; i < allPoints.length; ++i) {
        let currentMoment: Moment = moment(allPoints[i].timestamp, 'YYYY-MM-DD hh:mm:ss');
        if(currentMoment.isAfter(upperBoundMoment)) {
            upperBoundIndex = i - 1;
            break;
        }
    }
    return upperBoundIndex;
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

export default Map;