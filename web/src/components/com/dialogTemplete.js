
import React, {useRef, useEffect, useState} from 'react';

import {
    Box, Button,
    DialogTitle, DialogContent, DialogActions,
    Dialog,
    Alert} from '@mui/material'


function DDialog({ 
    children, onClose,title, actions, msgs
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
                open={true}
                fullWidth
                maxWidth="md"
                >
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent dividers>
                        {
                            msgs ? Object.values(msgs)?.map((m, i) => <Alert key={`msg_${i}`} severity={m.type}>{m.content}</Alert>) : ''
                        }
                        {children}
                    </DialogContent>
                    <DialogActions>
                        {
                            actions?.map((c, i) => <Button 
                                                    key={`act_${i}`} 
                                                    onClick={e => {
                                                        c.func()
                                                            .then(r => {
                                                                if (c.finishToClose) {
                                                                    onClose()
                                                                }
                                                            })
                                                            .catch(console.log)
                                                    }}>{c.title}</Button>)
                        }
                        <Button autoFocus onClick={onClose}>
                            關閉
                        </Button>
                    </DialogActions>
            </Dialog>
        </Box>
    );
}
const DialogTemplete = ({children,title, onClose, ...others}) => {
    const [open, setOpen] = useState(false);

    return (
        <>
             <Button onClick={() => setOpen(true)}>{title}</Button>
             {
                open ? <DDialog 
                            title={title}
                            onClose={e => {
                                onClose();
                                setOpen(false);
                            }}
                            {...others}>
                            {children}
                </DDialog> : ''
             }
        </>
    );
}
export default DialogTemplete;