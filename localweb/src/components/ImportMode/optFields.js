import { Box,TextField } from "@mui/material"
import { useEffect, useState } from "react";
const OptFields = ({fd, onUpdate, scaleStat, autoScale}) => {
    const [value, setValue] = useState({car: "", driver: "", number: 0, empty: 0})
    useEffect(() => {
        setValue(fd)
    },[fd])
    useEffect(() => {
        //scaleStat.status
        //scaleStat.status === "ST"
        if (autoScale && (scaleStat.status === "ST")){
            onChange({number: scaleStat.weight});
        }
    }, [scaleStat])
    const onChange = (o) => {
        setValue({...value, ...o})
        onUpdate(o)
    }
    return <Box>
        <TextField
            variant='standard'
            value={value.car}
            onChange={e => onChange({ car: e.target.value})}
            label="車號"/>
        <TextField
            variant='standard'
            value={value.driver}
            onChange={e => onChange({ driver: e.target.value})}
            label="司機"/>
        <TextField
            variant="standard"
            label="總重"
            fullWidth
            value={value.number}
            onChange={e => onChange({ number: parseInt(e.target.value)})}
            type='number'/>
        <TextField
            variant="standard"
            fullWidth
            label="空車重"
            value={value.empty}
            onChange={e => onChange({ empty: parseInt(e.target.value)})}
            type='number'/>
    </Box>
}

export default OptFields;