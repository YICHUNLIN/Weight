
import React, {useRef, useEffect, useState} from 'react';

import {
    Box, Button,
    DialogTitle, DialogContent, DialogActions,
    Dialog,  TextField, Table, TableBody, TableCell,
    TableRow} from '@mui/material'
import {Alert} from '@mui/material';

import {GetWPs} from '../../Action/wp';
import {CreateOrUpdateReq} from '../../Action/req'


function AlertDialog({ 
    onClose, open, msg
} ) {
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
                maxWidth="md"
                >
                    <DialogContent dividers>
                        {msg}
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

export default AlertDialog;