import L, { LatLng } from 'leaflet';
import { ChangeEvent, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Moment } from 'moment';
import { Row, Col } from 'react-bootstrap';
import { MyStyledSlider } from './Slider';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const moment = require('moment');
var map: L.Map;
var allPoints = new Map<string, { position: L.LatLng, timestamp: string }[]>();
var heatLayers: L.Layer[] = [];
var gradients = [
    { 0.3: '#66ffff', 1.0: '#3399ff' },
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

function LeafletMap(props: {
    timeLowerValue: Moment,
    opacityVal: number,
    setOpacityVal: (opacityVal: number) => void,
    timeUpperValue: Moment,
    fullRange: { startMoment: Moment, endMoment: Moment },
    showTargets: boolean[],
    setShowTargets: (showTargets: boolean[]) => void,
}) {
    const [isInitialized, setIsInitialized] = useState(false);
    const updateIsInitialized = (isInitialized: boolean) => {
        setIsInitialized(isInitialized);
    }
    useEffect(() => {
        if (!isInitialized) {
            initializeMap(updateIsInitialized);
        } else {
            updateMap(props.timeLowerValue, props.timeUpperValue, props.opacityVal, props.showTargets);
        }
    }, [props.timeLowerValue, props.timeUpperValue, props.opacityVal, isInitialized, props.showTargets]);


    return (
        <>
            <Row style={{ width: "100%" }}>
                <p id="map" style={{ height: "370px", width: "90%", margin: "10px", marginRight: '0px', alignSelf: 'center' }}></p>
                <Col style={{ alignSelf: "center", height: "80%", marginTop: '30px', width: "10%" }}>
                    <p style={{ width: '10px', textAlign: 'center', fontSize: 10, margin: 0 }}>
                        <MyStyledSlider
                            sx={{
                                '& input[type="range"]': {
                                    WebkitAppearance: 'slider-vertical',
                                },
                                height: 200,
                            }}
                            style={{ boxShadow: "none", transition: 'none' }}
                            orientation="vertical"
                            defaultValue={50}
                            valueLabelDisplay="off"
                            onChange={(event: Event, value: number | number[], activeThumb: number) => props.setOpacityVal(value as number)}
                        />
                        Opacity
                    </p>
                </Col>
                <Row style={{ width: "100%" }}>
                    <Col>
                        <FormGroup>
                            <FormControlLabel style={{ alignSelf: 'center' }} control={
                                <Checkbox
                                    sx={{
                                        color: gradients[0][1],
                                        '&.Mui-checked': {
                                            color: gradients[0][1],
                                        },
                                    }}
                                    checked={props.showTargets[0]}
                                    onChange={(event: ChangeEvent<HTMLInputElement>, checked: boolean) => props.setShowTargets([checked, props.showTargets[1]])}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />} label='original_target' />
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <FormControlLabel style={{ alignSelf: 'center' }} control={
                                <Checkbox
                                    sx={{
                                        color: gradients[1][1],
                                        '&.Mui-checked': {
                                            color: gradients[1][1],
                                        },
                                    }}
                                    checked={props.showTargets[1]}
                                    onChange={(event: ChangeEvent<HTMLInputElement>, checked: boolean) => props.setShowTargets([props.showTargets[0], checked])}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />} label={Array.from(allPoints.keys())[1]} />
                        </FormGroup>
                    </Col>
                </Row>
            </Row>
        </>
    );
}

function initializeMap(setIsInitialized: (isInitialized: boolean) => void) {
    map = L.map("map", config).setView([initLat, initLong], initZoom);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    fetch('./andata_locations.json')
        .then((response: { json: () => any; }) => response.json())
        .then((json) => {
            for (let i = 0; i < json.length; i++) {
                let pointLat: number = json[i].lat;
                let pointLong: number = json[i].lng;
                let timestamp: string = json[i].time;
                let displayTimestamp = timestamp.substring(0, 19);
                let latLng_object = new L.LatLng(pointLat, pointLong);
                let prevPoints = allPoints.get(json[i].target);
                let newElement = {
                    position: latLng_object,
                    timestamp: displayTimestamp
                };
                allPoints.set(json[i].target, (prevPoints || []).concat(newElement));
            }
            setIsInitialized(true);
        });
}

function updateMap(timeLowerValue: Moment, timeUpperValue: Moment, opacityVal: number, showTargets: boolean[]) {
    let currentPoints: LatLng[][] = [[], []];

    let i = 0;
    for (let target of Array.from(allPoints.keys())) {
        for (let point of allPoints.get(target) || []){
            let pointTime: Moment = moment(point.timestamp, 'YYYY-MM-DD HH:mm:ss');
            if (pointTime.isAfter(timeLowerValue) && timeUpperValue.isAfter(pointTime)) {
                let pointLat: number = point.position.lat;
                let pointLong: number = point.position.lng;
                let latLng_object = new L.LatLng(pointLat, pointLong);
                currentPoints[i].push(
                    latLng_object
                )
            }
        }
        i++;
    }

    if (currentPoints.flat().length > 0) {
        let center = getCentralPoint(currentPoints.flat(1));
        map.panTo(center);
    }

    for (let i=0; i < currentPoints.length; i++) {
        if (heatLayers[i] !== undefined && heatLayers[i] !== null) {
            map.removeLayer(heatLayers[i]);
        }
        if (showTargets[i]) {
            heatLayers[i] = L.heatLayer(currentPoints[i], {
                radius: 8, minOpacity: opacityVal / 100, blur: 4,
                gradient: gradients[i]
            }).addTo(map);
        }
    }
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

export default LeafletMap;