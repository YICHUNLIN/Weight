

import { Box, TextField } from '@mui/material';
import OptSelect from '../com/OptSelect';
const DefaultValues = ({fd, onUpdate, items}) => {
    return <Box>
        <OptSelect title={"載運內容物"} data={items} v={fd.item} onSelect={e => onUpdate({item: e})}/>
        <TextField
            variant='standard'
            fullWidth
            value={fd.client}
            onChange={e => onUpdate({client: e.target.value})}
            label={"客戶"}/>
        <TextField
            variant='standard'
            fullWidth
            value={fd.source_or_destination}
            onChange={e => onUpdate({source_or_destination: e.target.value})}
            label={"來源"}/>
    </Box>
}

export default DefaultValues