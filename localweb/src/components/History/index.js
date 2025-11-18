
import * as React from 'react';
import PropTypes from 'prop-types';
import {Table, TableHead, TableRow, TableCell, TableBody, TextField, Button} from '@mui/material';
import { PageContainer, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { getRangeRecord } from '../../action/scale';
import { useEffect } from 'react';
import { useState } from 'react';
import { GetUsers } from '../../action/auth';
import { XLSX_write_ForRangeRecordsBydate } from '../com/ExportExcel';

const Content = ({date, data, users}) => {
  return <>
    <TableRow><TableCell colSpan={10}>{date}</TableCell></TableRow>
    {
      data.map((d, i) => <TableRow key={`${date}_${i}`}>
        <TableCell></TableCell>
        <TableCell style={{ backgroundColor: d.inorout !== "INPORT" ? "#ff8400ff" : "#14cc76ff" }} >
          {d.inorout === "INPORT" ? "進場" : "出場"}
        </TableCell>
        <TableCell>{d.client} / {d.source_or_destination}</TableCell>
        <TableCell>{d.item}</TableCell>
        <TableCell>{d.number}</TableCell>
        <TableCell>{d.empty}</TableCell>
        <TableCell>{d.car} / {d.driver}</TableCell>
        <TableCell>{ (new Date(d.createdAt)).toLocaleTimeString()}</TableCell>
        <TableCell>{!users.hasOwnProperty(d.createdBy) ? "---" : users[d.createdBy].account}</TableCell>
      </TableRow>)
    }
  </>
}

function History({ pathname }) {
  const [users, setUsers] = useState({})
  const [search, setSearch] = useState(
      {start: new Date().toISOString().split('T')[0], 
        end: new Date().toISOString().split('T')[0]
    })
  const [data, setData] = useState({})
  useEffect(() => {
      getRangeRecord(search.start, search.end)
        .then(setData)
        .catch(console.log)
  }, [search])

  useEffect(() => {
    GetUsers()
      .then(us => setUsers(us.reduce((map, u) => ({...map, [u.id]:u}), {})))
      .catch(console.log)
  }, [])
  const update = (data) =>{
    setSearch({...search, ...data})
  }
  return (<PageContainer  >
      <PageHeaderToolbar>
        <TextField
            label=""
            value={search.start}
            variant="standard"
            type='date'
            onChange={e => update({start: e.target.value})}
            fullWidth/>
        -
        <TextField
            label=""
            value={search.end}
            onChange={e => update({end: e.target.value})}
            variant="standard"
            type='date'
            fullWidth/>
        <Button onClick={e => {
          // const v = Object.values(data).reduce((map, v) => [...map, ...v], []);
          XLSX_write_ForRangeRecordsBydate(data, users)
        }}>匯出excel</Button>
      </PageHeaderToolbar>
      <Table>
          <TableHead>
              <TableRow>
                  <TableCell>序號</TableCell>
                  <TableCell>進/出</TableCell>
                  <TableCell>來源/目的地</TableCell>
                  <TableCell>貨物內容</TableCell>
                  <TableCell>總重</TableCell>
                  <TableCell>空車重</TableCell>
                  <TableCell>車輛/司機</TableCell>
                  <TableCell>時間</TableCell>
                  <TableCell>紀錄者</TableCell>
              </TableRow>
          </TableHead>
          <TableBody>
            {
              Object.keys(data)
                .map(date => <Content 
                                key={`${date}_row_content`} 
                                date={date} 
                                users={users}
                                data={data[date]}/>)
            }
          </TableBody>
      </Table>
  </PageContainer>
  );
}

History.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default History;