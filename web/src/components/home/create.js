import React, {useEffect,useState } from 'react';
import DialogTemplete from '../com/dialogTemplete';
import { List, ListItem, TextField } from '@mui/material';
import {Radio, RadioGroup, FormControlLabel, FormControl, FormLabel} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs';
import OptSelect from '../com/OptSelect';


const items = [
    {name: "土資:B5"},
    {name: "土資:B2-3"},
    {name: "土資:B2"},
    {name: "土資:土石混合物"},
    {name: "廢:瀝青刨除料"},
    {name: "材:二分石"},
    {name: "材:三分石"},
    {name: "材:六分石"},
    {name: "材:再生石"},
    {name: "材:機制砂(粗)"},
    {name: "材:水洗砂(極細)"},
    {name: "材:粉刷砂(細)"},
    {name: "材料：其他"}
];

const InOutSelect = ({onChange}) => {
    const [value, setValue] = useState("INPORT")
    useEffect(() => {
        onChange(value)
    },[])
    return (
    <FormControl>
      <FormLabel>進場/出場選擇</FormLabel>
      <RadioGroup row onChange={e => {
        setValue(e.target.value);
        onChange(e.target.value)
      }} defaultValue={value}>
        <FormControlLabel value="INPORT" control={<Radio />} label="進場" />
        <FormControlLabel value="EXPORT" control={<Radio />} label="出場" />
      </RadioGroup>
    </FormControl>
  );
}


const Create = ({}) => {
    const [data, setData] = useState({inorout: "INPORT",time:dayjs(), number: 0, empty: 0, desc: ''})
    const [intervalId, setIntervalId] = useState(null);
    const [errMsgs, setErrMsgs] = useState({})
    useEffect(() => {
        const id = setInterval(() => {
            const t = dayjs()
            setData({...data,time: t})
        }, 60* 1000);
        setIntervalId(id)
        setErrMsgs({})
    }, [])
    const check = (dd) => {
            const fields = {
                item: {
                    type: "string",
                    name: "載運內容物"
                },
                source_or_destination: {
                    type: "string",
                    name: "來源或目的地"
                },
                driver: {
                    type: "string",
                    name: "司機"
                },
                car: {
                    type: "string",
                    name: "車號"
                },
                number: {
                    type: "number",
                    name: "總重"
                },
                empty: {
                    type: "number",
                    name: "空車重"
                }
            }
            let errs = {}
            Object.keys(fields)
                .forEach(f => {
                    if (dd.hasOwnProperty(f) && dd[f]) {
                        if (typeof dd[f] === fields[f].type){
                            delete errs[f]
                        }else {
                            errs = {...errs, [f]: `${fields[f].name} 欄位格式錯誤`}
                        }
                    } else {
                        errs = {...errs, [f]: `${fields[f].name} 欄位沒有填寫`}
                    }
                })
            if (dd.empty && dd.number){
                if (dd.empty <= dd.number) delete errs.we;
                else errs.we = "空車重不得大於總重"
            }
            if (dd.item && (dd.item === "材料：其他")){
                if (dd.desc === '') errs.desc = "物料為 '材料：其他'時,物料說明不可空白"
                else delete errs.desc;
            }
            setErrMsgs(errs)
    }
    const onUpdate = (d) => {
        const dd = {...data, ...d}
        setData(dd);
        check(dd)
    }
    return <DialogTemplete 
        msgs={Object.keys(errMsgs).reduce((map, v) => ({...map, [v]: { type: "error", content: errMsgs[v]}}), {})}
        title="新增紀錄" onClose={e => {
        clearInterval(intervalId);
        setIntervalId(null);
    }} 
            actions={[
                {
                    title: "確認",
                    func: () => new Promise((resolve, reject) => {
                        //MARK: TODO 這裡呼叫新增Record的API
                        return Object.keys(errMsgs).length > 0 ? reject() : resolve();
                    }),
                    finishToClose: true
                }
            ]}>
                <List>
                    <ListItem>
                        <InOutSelect onChange={value => onUpdate({inorout: value})}/>
                    </ListItem>
                    <ListItem>
                        時間：
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker 
                                value={data.time}
                                onChange={(value) => {
                                    if (value){
                                        onUpdate({time: value})
                                    } else {
                                        onUpdate({time: dayjs})
                                    }
                                }}
                                renderInput={(params) => <TextField variant="standard" {...params}/>}
                                ampm={false}/>
                        </LocalizationProvider>
                    </ListItem>
                    <ListItem>
                        <TextField
                            variant='standard'
                            fullWidth
                            onChange={e => onUpdate({source_or_destination: e.target.value})}
                            label={data.inorout === "INPORT" ? "來源":"目的地"}/>
                    </ListItem>
                    <ListItem>
                        <TextField
                            variant='standard'
                            fullWidth
                            onChange={e => onUpdate({car: e.target.value})}
                            label="車號"/>
                        <TextField
                            variant='standard'
                            fullWidth
                            onChange={e => onUpdate({driver: e.target.value})}
                            label="司機"/>
                    </ListItem>
                    <ListItem>
                        <OptSelect title={"載運內容物"} data={items} onSelect={e => onUpdate({item: e})}/>
                    </ListItem>
                    <ListItem>
                        <TextField
                            variant="standard"
                            fullWidth
                            label="物料說明(Enter 多行)"
                            multiline
                            value={data.desc}
                            onChange={e => onUpdate({desc: e.target.value})}
                            />
                    </ListItem>
                    <ListItem>
                        <TextField
                            variant="standard"
                            fullWidth
                            value={data.number}
                            label="總重"
                            onChange={e => onUpdate({ number: parseInt(e.target.value)})}
                            type='number'/>
                    </ListItem>
                    <ListItem>
                        <TextField
                            variant="standard"
                            fullWidth
                            value={data.empty}
                            label="空車重"
                            onChange={e => onUpdate({empty: parseInt(e.target.value)})}
                            type='number'/>
                    </ListItem>
                </List>

    </DialogTemplete>

}

export default Create;