import L, { LatLng } from 'leaflet';
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Moment } from 'moment';
import Slider from '@mui/material/Slider';
import { Row, Col } from 'react-bootstrap';
import { MyStyledSlider } from './Slider';

const moment = require('moment');
var map: L.Map;
var allPoints: { position: LatLng, timestamp: string }[] = [];
var heatLayer: L.Layer;

const config = {
    minZoom: 1,
    maxZoom: 23,
};
const initZoom = 9;

const initLat = 45.3;
const initLong = 8.0;

function Map(props: {
    timeLowerValue: Moment,
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
            updateMap(props.timeLowerValue, props.opacityVal, props.delta);
        }
    }, [props.timeLowerValue, props.opacityVal, props.delta, isInitialized]);


    return (
        <>
            <Row style={{ width: "100%" }}>
                <p id="map" style={{ height: "50vh", width: "50%", margin: "30px", marginRight: '10px', alignSelf: 'center' }}></p>
                <Col className='col-sm-1' style={{ alignSelf: "center", height: "80%", marginTop:'30px', width: "100" }}>
                    <MyStyledSlider
                        sx={{
                            '& input[type="range"]': {
                                WebkitAppearance: 'slider-vertical',
                            },
                            height: 200, alignSelf: 'center'
                        }}
                        orientation="vertical"
                        defaultValue={50}
                        aria-label="Temperature"
                        valueLabelDisplay="off"
                        onChange={(event: Event, value: number | number[], activeThumb: number) => props.setOpacityVal(value as number)}
                    />
                    <p style={{ textAlign: 'center', fontSize: 8 }}>
                        Opacity
                    </p>
                </Col>
            </Row>
            {/* {
                isInitialized ?
                    <div style={{ textAlign: 'center', paddingTop: 10 }}>
                        Time: from {allPoints[getLowerBound(props.timeLowerValue)].timestamp}
                        &nbsp;to {allPoints[getUpperBound(props.timeLowerValue, props.delta)].timestamp}
                    </div> : null
            } */}
        </>
    );
}

function initializeMap(setIsInitialized: (isInitialized: boolean) => void) {
    map = L.map("map", config).setView([initLat, initLong], initZoom);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
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

function updateMap(timeLowerValue: Moment, opacityVal: number, delta: number) {
    let currentPoints: LatLng[] = [];
    let timeUpperValue: Moment = new moment(timeLowerValue);
    timeUpperValue.add(delta, 'minutes');
    for (let i = 0; i < allPoints.length; i++) {
        let pointTime: Moment = moment(allPoints[i].timestamp, 'YYYY-MM-DD hh:mm:ss');
        if (pointTime.isAfter(timeLowerValue) && timeUpperValue.isAfter(pointTime)) {
            let pointLat: number = allPoints[i].position.lat;
            let pointLong: number = allPoints[i].position.lng;
            let latLng_object = new L.LatLng(pointLat, pointLong);
            currentPoints.push(
                latLng_object
            )
        }
    }
    if (currentPoints.length > 0) {
        let center = getCentralPoint(currentPoints);
        map.panTo(center);
    }
    if (heatLayer !== undefined && heatLayer !== null) {
        map.removeLayer(heatLayer);
    }
    heatLayer = L.heatLayer(currentPoints, { radius: 8, minOpacity: opacityVal / 100, blur: 4, 
    gradient: {0.3: '#66ffff',1.0: '#003399'} }).addTo(map);
}

// returns an index of the allPoints array
// function getLowerBound(sliderVal: number): number {
//     let lowerBoundIndex = Math.round(allPoints.length * sliderVal / 100);
//     return lowerBoundIndex < allPoints.length ? lowerBoundIndex : allPoints.length - 1;
// }

// returns an index of the allPoints array
// function getUpperBound(sliderVal: number, delta: number): number {
//     // get lower bound element and parse its timestamp
//     // start scanning from lower bound until timestamp < lower_bound_timestamp + delta
//     let lowerBoundIndex: number = getLowerBound(sliderVal);
//     let lowerBoundTimestamp: string = allPoints[lowerBoundIndex].timestamp;
//     let lowerBoundMoment: Moment = moment(lowerBoundTimestamp, 'YYYY-MM-DD hh:mm:ss');
//     let upperBoundMoment: Moment = lowerBoundMoment.add(delta, "minutes");
//     let upperBoundIndex: number = allPoints.length - 1;
//     for (let i = lowerBoundIndex; i < allPoints.length; ++i) {
//         let currentMoment: Moment = moment(allPoints[i].timestamp, 'YYYY-MM-DD hh:mm:ss');
//         if (currentMoment.isAfter(upperBoundMoment)) {
//             upperBoundIndex = i - 1;
//             break;
//         }
//     }
//     return upperBoundIndex;
// }

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