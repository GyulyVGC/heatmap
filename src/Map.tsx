import L, { LatLng } from 'leaflet';
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Moment } from 'moment';
import { Row, Col } from 'react-bootstrap';
import { MyStyledSlider } from './Slider';

const moment = require('moment');
var map: L.Map;
var allPoints: { position: LatLng, timestamp: string }[][] = [[], []];
var heatLayers: L.Layer[] = [];
var gradients = [
    { 0.3: '#66ffff', 1.0: '#003399' },
    { 0.3: '#ff66ff', 1.0: '#993300' },
    { 0.3: '#ffff66', 1.0: '#339900' }
]

const config = {
    minZoom: 1,
    maxZoom: 23,
};
const initZoom = 8;

const initLat = 45.3;
const initLong = 8.0;

function Map(props: {
    timeLowerValue: Moment,
    opacityVal: number,
    setOpacityVal: (opacityVal: number) => void,
    delta: number,
    setDelta: (delta: number) => void,
    fullRange: { startMoment: Moment, endMoment: Moment },
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
                <p id="map" style={{ height: "50vh", width: "50%", margin: "30px", marginRight: '0px', alignSelf: 'center' }}></p>
                <Col style={{ alignSelf: "center", height: "80%", marginTop: '30px', width: "10px" }}>
                    <p style={{ width: '10px', textAlign: 'center', fontSize: 10, margin: 0 }}>
                        <MyStyledSlider
                            sx={{
                                '& input[type="range"]': {
                                    WebkitAppearance: 'slider-vertical',
                                },
                                height: 200,
                            }}
                            orientation="vertical"
                            defaultValue={50}
                            valueLabelDisplay="off"
                            onChange={(event: Event, value: number | number[], activeThumb: number) => props.setOpacityVal(value as number)}
                        />
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
    // let arrayToWrite: { position: LatLng, timestamp: string }[] = [];

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    fetch('./andata.json')
        .then((response: { json: () => any; }) => response.json())
        .then((json) => {
            for (let i = 0; i < json.length; i++) {
                let pointLat: number = json[i].lat;
                let pointLong: number = json[i].lng;
                let timestamp: string = json[i].time;
                let displayTimestamp = timestamp.substring(0, 19);
                let latLng_object = new L.LatLng(pointLat, pointLong);
                if (json[i].target === "new_target") {
                    allPoints[1].push({
                        position: latLng_object,
                        timestamp: displayTimestamp
                    })
                } else {
                    allPoints[0].push({
                        position: latLng_object,
                        timestamp: displayTimestamp
                    })
                }
            }
            setIsInitialized(true);
        });
}

function updateMap(timeLowerValue: Moment, opacityVal: number, delta: number) {
    let currentPoints: LatLng[][] = [[], []];
    let timeUpperValue: Moment = new moment(timeLowerValue);
    timeUpperValue.add(delta, 'minutes');
    let firstPerson = allPoints[0];
    let secondPerson = allPoints[1];
    for (let i = 0; i < firstPerson.length; i++) {
        let pointTime: Moment = moment(firstPerson[i].timestamp, 'YYYY-MM-DD HH:mm:ss');
        if (pointTime.isAfter(timeLowerValue) && timeUpperValue.isAfter(pointTime)) {
            let pointLat: number = firstPerson[i].position.lat;
            let pointLong: number = firstPerson[i].position.lng;
            let latLng_object = new L.LatLng(pointLat, pointLong);
            currentPoints[0].push(
                latLng_object
            )
        }
    }
    for (let i = 0; i < secondPerson.length; i++) {
        let pointTime: Moment = moment(secondPerson[i].timestamp, 'YYYY-MM-DD HH:mm:ss');
        if (pointTime.isAfter(timeLowerValue) && timeUpperValue.isAfter(pointTime)) {
            let pointLat: number = secondPerson[i].position.lat;
            let pointLong: number = secondPerson[i].position.lng;
            let latLng_object = new L.LatLng(pointLat, pointLong);
            currentPoints[1].push(
                latLng_object
            )
        }
    }
    if (currentPoints.flat(1).length > 0) {
        let center = getCentralPoint(currentPoints.flat(1));
        map.panTo(center);
    }
    if (heatLayers[0] !== undefined && heatLayers[0] !== null) {
        map.removeLayer(heatLayers[0]);
    }
    heatLayers[0] = L.heatLayer(currentPoints[0], {
        radius: 8, minOpacity: opacityVal / 100, blur: 4,
        gradient: gradients[0]
    }).addTo(map);
    if (heatLayers[1] !== undefined && heatLayers[1] !== null) {
        map.removeLayer(heatLayers[1]);
    }
    heatLayers[1] = L.heatLayer(currentPoints[1], {
        radius: 8, minOpacity: opacityVal / 100, blur: 4,
        gradient: gradients[1]
    }).addTo(map);
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