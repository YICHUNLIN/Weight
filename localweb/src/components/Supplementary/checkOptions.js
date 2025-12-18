import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";

const label = { slotProps: { input: { 'aria-label': 'Checkbox demo' } } };
const CheckOptions = ({onCheck}) => {
    const [data, setData] = useState({carInfo: true})
    useEffect(() => {onCheck(data)}, [data])
    const update = (o) => {
        const d = {...data, ...o}
        onCheck(d)
        setData(d)
    }
    return <>
        <FormGroup>
            <FormControlLabel 
                control={
                    <Checkbox defaultChecked {...label} 
                                onChange={e => update({ carInfo: e.target.checked})}/>
                        } 
                label="儲存空車重與司機資訊(當日使用)" />
        </FormGroup>
    </>
}

export default CheckOptions;