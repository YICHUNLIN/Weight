import React, {useEffect,useState } from 'react';
import { connect } from 'react-redux'
import {Table,TableBody,TableHead,TableCell,TableRow,Typography} from '@mui/material';
const Setting = ({}) => {
    return <>
        <Typography variant="h5" gutterBottom>
            設定
        </Typography>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>項目</TableCell>
                    <TableCell>數值</TableCell>
                </TableRow>
            </TableHead>
            <TableBody></TableBody>
        </Table>
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(Setting) 