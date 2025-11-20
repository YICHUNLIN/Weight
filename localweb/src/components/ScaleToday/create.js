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
import OptSelect from '../com/OptSelect';
import { createRecord } from '../../action/scale';

function TransactionDialog({ payload, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [enable, setEnable] = useState(false);
  const { formData } = useFormContext();
  useEffect(() => {
    const fields = ['empty', 'item', 'inorout', 'source_or_destination', 
      'client', 'car', 'client'];
    if (fields.filter(f => formData.hasOwnProperty(f) && (formData[f] !== "") && (typeof formData[f] !== 'number' ? true : (formData[f] !== 0))).length === fields.length){
      setEnable(true)
    }else {
      setEnable(false)
    }
  }, [formData])

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>新增</DialogTitle>
      <DialogContent>{payload.component}</DialogContent>
      <DialogActions>
        <Button
          loading={loading}
          disabled={!enable}
          onClick={async () => {
            setLoading(true);
            try {
              createRecord(formData)
                .then(r => {
                  onClose(formData);
                })
                .catch(err => console.log(err))
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

function RecordForms({items}) {
  const { formData, setFormData } = useFormContext();
  const Update = (data) => {
    setFormData({...formData, ...data})
  }
  return (
          <List>
            <ListItem>
                <InOutSelect onChange={value =>Update({ inorout: value})}/>
            </ListItem>
            <ListItem>
            </ListItem>
            <ListItem>
                <TextField
                    variant='standard'
                    value={formData.client}
                    fullWidth
                    onChange={e => Update({ client: e.target.value})}
                    label={"客戶"}/>
                <TextField
                    variant='standard'
                    fullWidth
                    value={formData.source_or_destination}
                    onChange={e => Update({ source_or_destination: e.target.value})}
                    label={`${formData.inorout === "INPORT" ? "來源" : "目的地"}`}/>
            </ListItem>
            <ListItem>
                <TextField
                    variant='standard'
                    fullWidth
                    value={formData.car}
                    onChange={e => Update({ car: e.target.value})}
                    label="車號"/>
                <TextField
                    variant='standard'
                    fullWidth
                    value={formData.driver}
                    onChange={e => Update({ driver: e.target.value})}
                    label="司機"/>
            </ListItem>
            <ListItem>
                <OptSelect title={"載運內容物"} data={items} onSelect={e => Update({ item: e})}/>
            </ListItem>
            <ListItem>
                <TextField
                    variant="standard"
                    fullWidth
                    label="物料說明(Enter 多行)"
                    multiline
                    value={formData.desc}
                    onChange={e => Update({ desc: e.target.value})}
                    />
            </ListItem>
            <ListItem>
                <TextField
                    variant="standard"
                    fullWidth
                    label="總重"
                    value={formData.number}
                    onChange={e => Update({ number: parseInt(e.target.value)})}
                    type='number'/>
            </ListItem>
            <ListItem>
                <TextField
                    variant="standard"
                    fullWidth
                    label="空車重"
                    value={formData.empty}
                    onChange={e => Update({ empty: parseInt(e.target.value)})}
                    type='number'/>
            </ListItem>
        </List>
  );
}

function Content({onUpdate, onInit, items}) {
  const dialogs = useDialogs();

  return (
    <Button
        onClick={async () => {
          onInit()
          const data = await dialogs.open(TransactionDialog, {
            component: <RecordForms items={items}/>
          });
          onUpdate()
        }}
      >
        新增過磅紀錄
      </Button>
  );
}
const initFormData = {
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
  };
export default function Create({onUpdate, items}) {
  const [formData, setFormData] = React.useState(initFormData);

  const contextValue = React.useMemo(() => ({ formData, setFormData }), [formData]);

  return (
    <FormContext.Provider value={contextValue}>
      <DialogsProvider>
        <Content onUpdate={onUpdate} items={items} onInit={e => {
          setFormData(initFormData)
        }}/>
      </DialogsProvider>
    </FormContext.Provider>
  );
}