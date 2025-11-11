import React, { useRef, useState } from 'react';
import { Button } from '@mui/material';
import {TextField, DialogActions, Box, Dialog, DialogTitle, DialogContent} from '@mui/material';
import PropTypes from 'prop-types';


function CheckDialog({ 
    onClose,  onConfirm,  open, title, ...other 
} ) {
const [loading, setLoading] = useState(false)
const radioGroupRef = useRef(null);
const handleEntering = () => {
    if (radioGroupRef.current != null) {
        radioGroupRef.current.focus();
    }
}

return (
    <Box component="form">
        <Dialog
        TransitionProps={{ onEntering: handleEntering }}
        open={open}
        {...other}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
            <Box
                noValidate
                component="form"
                sx={{
                display: 'flex',
                flexDirection: 'column',
                m: 'auto',
                width: 'fit-content',
                }}
            >
                <Button disabled={loading} 
                        color='error'
                        onClick={e => {
                            setLoading(true)
                            onConfirm()
                                .then(r => {
                                    setLoading(false)
                                    onClose()
                                })
                                .catch(err => console.log(err))
                        }}>確定</Button>
            </Box>
            </DialogContent>
            <DialogActions>

                <Button autoFocus onClick={onClose}>
                    關閉
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
);
}

CheckDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};
const DoSomeThingAsk = ({onReload, onConfirm, title, buttonText}) => {
    const [open, setOpen] = useState(false)
    return <>
        <Button 
            color="error"
            onClick={e => setOpen(true)}>
                {buttonText}
        </Button>
        {
            open ? <CheckDialog 
                        title={title}
                        open={open} 
                        onConfirm={e => onConfirm()}
                        onClose={e => {
                            onReload()
                            setOpen(false);
                        }}/> : ""
        }
    </>
}
export default DoSomeThingAsk