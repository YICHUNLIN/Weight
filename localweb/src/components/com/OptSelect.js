
import React, {useState} from 'react';
import {Select, MenuItem, FormControl, InputLabel} from '@mui/material';
import { useEffect } from 'react';

 const OptSelect = ({data, onSelect, valueField = "name",title, v, ...other}) => {
    const [value, setValue] = useState('');
    useEffect(() => {
        if(v) setValue(v)
    }, [v])
    const Items = () => {
        const total = data.map((p, i) => <MenuItem 
                                                value={p[valueField]}
                                                key={`data_select_${i}`}>
                         {p.name}
                    </MenuItem>)
        return total;
    }
    return <FormControl size='small' fullWidth>
        <InputLabel>{title}</InputLabel>
        <Select value={value} {...other}   onChange={e => {
            setValue(e.target.value);
            onSelect(e.target.value);
        }}>
            { Items() }
        </Select>
    </FormControl>
}

export default OptSelect