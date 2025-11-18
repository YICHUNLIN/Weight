import * as React from 'react';
import PropTypes from 'prop-types';
import { DialogsProvider, useDialogs } from '@toolpad/core/useDialogs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import {
  TextField, FormControl, FormLabel, 
  List, ListItem,
  RadioGroup, FormControlLabel, Radio} from '@mui/material';
import { FormContext, useFormContext } from './TransferFormContext';
import { useEffect } from 'react';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import OptSelect from '../com/OptSelect';
import dayjs from 'dayjs';

function TransactionDialog({ payload, open, onClose }) {
  const [loading, setLoading] = React.useState(false);
  const [enable, setEnable] = useState(false)
  const { formData } = useFormContext();
  useEffect(() => {
    const fields = ['empty', 'item', 'inorout', 'source_or_destination', 
      'client', 'car', 'client'];
    if (fields.filter(f => formData.hasOwnProperty(f) && (formData[f] !== "")).length === fields.length)
      setEnable(true)
    else setEnable(false)
  }, [formData])

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Confirm transfer</DialogTitle>
      <DialogContent>{payload.component}</DialogContent>
      <DialogActions>
        <Button
          loading={loading}
          disabled={!enable}
          onClick={async () => {
            setLoading(true);
            try {
              //onClose(formData);
            } finally {
              setLoading(false);
            }
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

TransactionDialog.propTypes = {
  /**
   * A function to call when the dialog should be closed. If the dialog has a return
   * value, it should be passed as an argument to this function. You should use the promise
   * that is returned to show a loading state while the dialog is performing async actions
   * on close.
   * @param result The result to return from the dialog.
   * @returns A promise that resolves when the dialog can be fully closed.
   */
  onClose: PropTypes.func.isRequired,
  /**
   * Whether the dialog is open.
   */
  open: PropTypes.bool.isRequired,
  /**
   * The payload that was passed when the dialog was opened.
   */
  payload: PropTypes.shape({
    component: PropTypes.node,
    data: PropTypes.string.isRequired,
  }).isRequired,
};


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

    return (
    <FormControl>
      <FormLabel>進場/出場選擇</FormLabel>
      <RadioGroup row onChange={e => {
        setValue(e.target.value);
        onChange(e.target.value)
      }} value={value}>
        <FormControlLabel value="INPORT" control={<Radio />} label="進場" />
        <FormControlLabel value="EXPORT" control={<Radio />} label="出場" />
      </RadioGroup>
    </FormControl>
  );
}

function RecordForms() {
  const { formData, setFormData } = useFormContext();
  return (
          <List>
            <ListItem>
                <InOutSelect onChange={value =>setFormData({...formData, inorout: value})}/>
                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker 
                        value={formData.time}
                        onChange={(value) => {
                            if (value){
                                setFormData({time: value})
                            } else {
                                setFormData({time: dayjs()})
                            }
                        }}
                        renderInput={(params) => <TextField variant="standard" {...params}/>}
                        ampm={false}/>
                </LocalizationProvider> */}
            </ListItem>
            <ListItem>
            </ListItem>
            <ListItem>
                <TextField
                    variant='standard'
                    value={formData.client}
                    fullWidth
                    onChange={e => setFormData({...formData, client: e.target.value})}
                    label={"客戶"}/>
                <TextField
                    variant='standard'
                    fullWidth
                    value={formData.source_or_destination}
                    onChange={e => setFormData({...formData, source_or_destination: e.target.value})}
                    label={`${formData.inorout === "INPORT" ? "來源" : "目的地"}`}/>
            </ListItem>
            <ListItem>
                <TextField
                    variant='standard'
                    fullWidth
                    value={formData.car}
                    onChange={e => setFormData({...formData, car: e.target.value})}
                    label="車號"/>
                <TextField
                    variant='standard'
                    fullWidth
                    value={formData.driver}
                    onChange={e => setFormData({...formData, driver: e.target.value})}
                    label="司機"/>
            </ListItem>
            <ListItem>
                <OptSelect title={"載運內容物"} v={formData.item} data={items} onSelect={e => setFormData({...formData, item: e})}/>
            </ListItem>
            <ListItem>
                <TextField
                    variant="standard"
                    fullWidth
                    label="物料說明(Enter 多行)"
                    multiline
                    value={formData.desc}
                    onChange={e => setFormData({...formData, desc: e.target.value})}
                    />
            </ListItem>
            <ListItem>
                <TextField
                    variant="standard"
                    fullWidth
                    label="總重"
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: parseInt(e.target.value)})}
                    type='number'/>
            </ListItem>
            <ListItem>
                <TextField
                    variant="standard"
                    fullWidth
                    label="空車重"
                    value={formData.empty}
                    onChange={e => setFormData({...formData, empty: parseInt(e.target.value)})}
                    type='number'/>
            </ListItem>
        </List>
  );
}

function Content() {
  const dialogs = useDialogs();

  return (
    <Button
        onClick={async () => {
          // preview-start
          const data = await dialogs.open(TransactionDialog, {
            component: <RecordForms/>
          });
          console.log(data)
        }}
      >
        更新
      </Button>
  );
}

export default function Update({value}) {
  const [formData, setFormData] = React.useState({
    number: 0,
    empty: 0,
    item: "",
    inorout: "INPORT",
    source_or_destination: "",
    client: "",
    driver: "",
    car: "",
    desc: "",
    client: ""
  });
  useEffect(() => {
    setFormData({...formData, ...value})
  }, [value])

  const contextValue = React.useMemo(() => ({ formData, setFormData }), [formData]);

  return (
    <FormContext.Provider value={contextValue}>
      <DialogsProvider>
        <Content />
      </DialogsProvider>
    </FormContext.Provider>
  );
}