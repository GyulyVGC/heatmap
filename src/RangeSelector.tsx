import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import styled from 'styled-components';


export default function BasicSelect() {
    const [age, setAge] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setAge(event.target.value as string);
    };

    return (
        <Box sx={{ minWidth: 120 }}>
            <div className="scrollbar scrollbar-primary">
                <div className="force-overflow"></div>
            </div>
            <FormControl style={{ width: "200px" }}>
                <InputLabel id="demo-simple-select-label">Range</InputLabel>
                <Select
                    labelId="1"
                    id="1"
                    value={age}
                    label="Range"
                    onChange={handleChange}
                >
                    <MenuItem value={10}>A</MenuItem>
                    <MenuItem value={20}>B</MenuItem>
                    <MenuItem value={30}>C</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}