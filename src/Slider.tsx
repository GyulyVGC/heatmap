import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';

import styled from 'styled-components';
import { Moment } from 'moment';
import { useState } from "react";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Row, Col } from 'react-bootstrap';

const moment = require('moment');

const getMarks = (fullRange: { startMoment: Moment, endMoment: Moment }) => {
    let startMoment = new moment(fullRange.startMoment);
    const fullRangeMinutes: number = moment.duration(fullRange.endMoment.diff(fullRange.startMoment)).asMinutes();
    const deltaBetweenMarks: number = fullRangeMinutes / 4;
    return [
        {
            value: 0,
            label: startMoment.format("HH:mm"),
        },
        {
            value: 25,
            label: startMoment.add(deltaBetweenMarks, "minutes").format("HH:mm"),
        },
        {
            value: 50,
            label: startMoment.add(deltaBetweenMarks, "minutes").format("HH:mm"),
        },
        {
            value: 75,
            label: startMoment.add(deltaBetweenMarks, "minutes").format("HH:mm"),
        },
        {
            value: 100,
            label: startMoment.add(deltaBetweenMarks, "minutes").format("HH:mm"),
        },
    ];
}


export const MyStyledSlider = styled(Slider)(() => ({
    color: '#3880ff',
    height: 2,
    padding: '15px 0',
    cursor: 'default',
    '& .Mui-Active': {
        opacity: 0.5,
        color: 'red',
    },
    '& .MuiSlider-thumb': {
        height: 12,
        width: 12,
        backgroundColor: 'blue 100',
        transition: 'none'
    },
    '& .MuiSlider-valueLabel': {
        fontSize: 10,
        fontWeight: 'normal',
        top: 0,
        backgroundColor: 'unset',
        color: '#bfbfbf',
        '&:before': {
            display: 'none',
        },
        '& *': {
            background: 'transparent',
            color: '#bfbfbf',
        },
    },
    '& .MuiSlider-track': {
        border: '2px #000',
        transition: 'none'
    },
    '& .MuiSlider-rail': {
        opacity: 1.0,
        backgroundColor: '#bfbfbf',
    },
    '& .MuiSlider-markLabel': {
        top: 30,
        color: '#bfbfbf',
        '&.MuiSlider-markLabelActive': {
            opacity: 1,
            color: 'currentColor',
        },
    },
    '& .MuiSlider-mark': {
        top: 24,
        backgroundColor: '#bfbfbf',
        height: 21,
        width: 1,
        '&.MuiSlider-markActive': {
            opacity: 1,
            width: 2,
            backgroundColor: 'currentColor',
        },
    }
}));

function fromTimeToSliderUnits(minutes: number, fullRangeMinutes: number): number {
    return minutes / fullRangeMinutes * 100;
}

function fromSliderUnitsToTimestamp(value: number, fullRange: { startMoment: Moment, endMoment: Moment }): string {
    const fullRangeMinutes: number = moment.duration(fullRange.endMoment.diff(fullRange.startMoment)).asMinutes();
    const toAdd = value * fullRangeMinutes / 100;
    let tempStart = new moment(fullRange.startMoment);
    return tempStart.add(toAdd, 'minutes').format("HH:mm");
}

function fromSliderUnitsToMoment(value: number, fullRange: { startMoment: Moment, endMoment: Moment }): Moment {
    const fullRangeMinutes: number = moment.duration(fullRange.endMoment.diff(fullRange.startMoment)).asMinutes();
    const toAdd = value * fullRangeMinutes / 100;
    let tempStart = new moment(fullRange.startMoment);
    return tempStart.add(toAdd, 'minutes');
}

function fromSliderRangeToMinutes(diff: number, fullRangeMinutes: number): number {
    return diff * fullRangeMinutes / 100;
}

const leftArrowClick = (fullRange: { startMoment: Moment, endMoment: Moment },
    setFullRange: ((fullRange: { startMoment: Moment, endMoment: Moment }) => void),
    timeLowerValue: Moment,
    setTimeLowerValue: (timeLowerValue: Moment) => void) => {
    const fullRangeMinutes: number = moment.duration(fullRange.endMoment.diff(fullRange.startMoment)).asMinutes();
    let newUpperBound: Moment = new moment(fullRange.startMoment);
    let newLowerBound: Moment = new moment(fullRange.startMoment);
    let newTimeLowerValue: Moment = new moment(timeLowerValue);
    newTimeLowerValue.subtract(fullRangeMinutes, 'minutes');
    setTimeLowerValue(newTimeLowerValue);
    newLowerBound.subtract(fullRangeMinutes, 'minutes');
    setFullRange({ startMoment: newLowerBound, endMoment: newUpperBound });
}

const rightArrowClick = (fullRange: { startMoment: Moment, endMoment: Moment },
    setFullRange: ((fullRange: { startMoment: Moment, endMoment: Moment }) => void),
    timeLowerValue: Moment,
    setTimeLowerValue: (timeLowerValue: Moment) => void) => {
    const fullRangeMinutes: number = moment.duration(fullRange.endMoment.diff(fullRange.startMoment)).asMinutes();
    let newLowerBound: Moment = new moment(fullRange.endMoment);
    let newUpperBound: Moment = new moment(fullRange.endMoment);
    let newTimeLowerValue: Moment = new moment(timeLowerValue);
    newTimeLowerValue.add(fullRangeMinutes, 'minutes');
    setTimeLowerValue(newTimeLowerValue);
    newUpperBound.add(fullRangeMinutes, 'minutes');
    setFullRange({ startMoment: newLowerBound, endMoment: newUpperBound });
}

export default function MySlider(props: {
    timeLowerValue: Moment,
    setTimeLowerValue: (timeLowerValue: Moment) => void,
    delta: number,
    setDelta: (delta: number) => void,
    date: Moment,
    setDate: (date: Moment) => void,
    fullRange: { startMoment: Moment, endMoment: Moment },
    setFullRange: ((fullRange: { startMoment: Moment, endMoment: Moment }) => void)
}) {
    const [sliderLowerValue, setSliderLowerValue] = useState(0);
    const updateSliderLowerValue = (sliderLowerValue: number) => {
        let time = fromSliderUnitsToMoment(sliderLowerValue, props.fullRange);
        props.setTimeLowerValue(time);
        setSliderLowerValue(sliderLowerValue);
    }
    const fullRangeMinutes: number = moment.duration(props.fullRange.endMoment.diff(props.fullRange.startMoment)).asMinutes();
    let sliderDelta: number = fromTimeToSliderUnits(props.delta, fullRangeMinutes);
    const handleChange = (
        event: Event,
        newValue: number | number[],
        activeThumb: number,
    ) => {
        if (!Array.isArray(newValue)) {
            return;
        }
        let sliderDiff = newValue[2] - newValue[0];
        let newDelta = fromSliderRangeToMinutes(sliderDiff, fullRangeMinutes);
        if (activeThumb === 0) {
            if (newDelta >= fullRangeMinutes / 8) {
                props.setDelta(newDelta);
            }
            const clamped = Math.min(newValue[0], 100 - sliderDelta);
            updateSliderLowerValue(clamped);
        } else if (activeThumb === 1) {
            const clamped = Math.max(newValue[1] - sliderDelta / 2, 0);
            updateSliderLowerValue(clamped);
        } else {
            if (newDelta >= fullRangeMinutes / 8) {
                props.setDelta(newDelta);
            } else {
                const clamped = Math.max(newValue[2] - sliderDelta, 0);
                updateSliderLowerValue(clamped);
            }
        }
    };

    if (sliderLowerValue + sliderDelta > 100) {
        updateSliderLowerValue(100 - sliderDelta);
    }

    return (
        <div style={{ textAlign: 'center' }}>
            {/* <CalendarMonthIcon sx={{fontSize: 45}}/> */}
            {props.timeLowerValue.format("DD MMMM")}
            <Row style={{ width: "60%", margin: 'auto' }}>
                <Col className='col-1'>
                    <Tooltip followCursor TransitionComponent={Zoom} title="previous" placement='top'>
                        <KeyboardArrowLeftIcon sx={{ fontSize: 40 }}
                            onClick={() => leftArrowClick(props.fullRange, props.setFullRange, props.timeLowerValue, props.setTimeLowerValue)}
                            style={{ cursor: "pointer" }} />
                    </Tooltip>
                </Col>
                <Col className='col-10'>
                    <MyStyledSlider
                        value={[sliderLowerValue, sliderLowerValue + sliderDelta / 2, sliderLowerValue + sliderDelta]}
                        onChange={handleChange}
                        step={3}
                        valueLabelDisplay="auto"
                        marks={getMarks(props.fullRange)}
                        style={{ boxShadow: "none", transition: 'none' }}
                        valueLabelFormat={(value) => <div>{fromSliderUnitsToTimestamp(value, props.fullRange)}</div>}
                    />
                </Col>
                <Col className='col-1'>
                    <Tooltip followCursor TransitionComponent={Zoom} title="next" placement='top'>
                        <KeyboardArrowRightIcon sx={{ fontSize: 40 }} onClick={() => rightArrowClick(props.fullRange, props.setFullRange, props.timeLowerValue, props.setTimeLowerValue)} style={{ cursor: "pointer" }} />
                    </Tooltip>
                </Col>
            </Row>
        </div>
    );
}