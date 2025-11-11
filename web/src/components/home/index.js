import React, {useEffect,useState } from 'react';
import { connect } from 'react-redux'
import {Table,TableBody,TableHead,TableCell,TableRow,Typography, Button} from '@mui/material';
import Create from './create';
const Home = ({}) => {
    const [date, setDate] = useState("")
    useEffect(() => {
        const date = new Date(); // Get the current date and time
        const formattedDate = date.toISOString().split('T')[0];
        setDate(formattedDate); // Example output: "2025-11-07"
    }, [])
    return <>
        <Typography variant="h5" gutterBottom>
            {date} 過磅
        </Typography>
        <Create/>
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
export default connect(mapStateToProps, {})(Home) 