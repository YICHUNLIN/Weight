import { Box,TextField } from "@mui/material"
const OptFields = ({fd, onUpdate}) => {
    return <Box>

        <TextField
            variant='standard'
            value={fd.car}
            onChange={e => onUpdate({ car: e.target.value})}
            label="車號"/>
        <TextField
            variant='standard'
            value={fd.driver}
            onChange={e => onUpdate({ driver: e.target.value})}
            label="司機"/>
        <TextField
            variant="standard"
            label="總重"
            fullWidth
            value={fd.number}
            onChange={e => onUpdate({ number: parseInt(e.target.value)})}
            type='number'/>
        <TextField
            variant="standard"
            fullWidth
            label="空車重"
            value={fd.empty}
            onChange={e => onUpdate({ empty: parseInt(e.target.value)})}
            type='number'/>
    </Box>
}

export default OptFields;