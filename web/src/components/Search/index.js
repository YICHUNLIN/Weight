import React, {useEffect,useState } from 'react';
import { connect } from 'react-redux'
import {Table,TableBody,TableHead,TableCell,TableRow,Typography} from '@mui/material';
const Search = ({}) => {
    return <>
        <Typography variant="h5" gutterBottom>
            搜尋
        </Typography>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>序號</TableCell>
                    <TableCell>時間</TableCell>
                    <TableCell>進/出</TableCell>
                    <TableCell>來源/目的地</TableCell>
                    <TableCell>車輛/司機</TableCell>
                    <TableCell>貨物內容</TableCell>
                    <TableCell>總重</TableCell>
                    <TableCell>空車重</TableCell>
                    <TableCell>紀錄者</TableCell>
                </TableRow>
            </TableHead>
            <TableBody></TableBody>
        </Table>
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(Search) 