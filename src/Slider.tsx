import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import styled from 'styled-components';
import { Moment } from 'moment';
import { useState } from "react";

const moment = require('moment');

const marks = [
    {
        value: 0,
        label: '06:00',
    },
    {
        value: 25,
        label: '08:00',
    },
    {
        value: 50,
        label: '10:00',
    },
    {
        value: 75,
        label: '12:00',
    },
    {
        value: 100,
        label: '14:00',
    },
];


export const MyStyledSlider = styled(Slider)(() => ({
    color: '#3880ff',
    height: 2,
    padding: '15px 0',
    '& .MuiSlider-thumb': {
        height: 12,
        width: 12,
        backgroundColor: 'blue 100',
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
    return tempStart.add(toAdd, 'minutes').format("hh:mm");
}

function fromSliderUnitsToMoment(value: number, fullRange: { startMoment: Moment, endMoment: Moment }): Moment {
    const fullRangeMinutes: number = moment.duration(fullRange.endMoment.diff(fullRange.startMoment)).asMinutes();
    const toAdd = value * fullRangeMinutes / 100;
    let tempStart = new moment(fullRange.startMoment);
    return tempStart.add(toAdd, 'minutes');
}

export default function MySlider(props: {
    timeLowerValue: Moment,
    setTimeLowerValue: (timeLowerValue: Moment) => void,
    delta: number,
    fullRange: { startMoment: Moment, endMoment: Moment }
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
        if (activeThumb === 0) {
            const clamped = Math.min(newValue[0], 100 - sliderDelta);
            updateSliderLowerValue(clamped);
        } else {
            const clamped = Math.max(newValue[1] - sliderDelta, 0);
            updateSliderLowerValue(clamped);
        }
    };

    if (sliderLowerValue + sliderDelta > 100) {
        updateSliderLowerValue(100 - sliderDelta);
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <Box sx={{ width: 400, margin: 'auto' }}>
                <MyStyledSlider
                    value={[sliderLowerValue, sliderLowerValue + sliderDelta]}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    disableSwap
                    marks={marks}
                    style={{ boxShadow: "none" }}
                    valueLabelFormat={(value) => <div>{fromSliderUnitsToTimestamp(value, props.fullRange)}</div>}
                />
            </Box>
        </div>
    );
}