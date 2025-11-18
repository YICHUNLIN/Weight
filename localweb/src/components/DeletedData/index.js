
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import {Table, TableHead, TableRow, TableCell, TableBody} from '@mui/material';
import { PageContainer, PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { getDeletedRecord } from '../../action/scale';
import { useEffect } from 'react';
import { useState } from 'react';
import OptSelect from '../com/OptSelect';
import { GetUsers } from '../../action/auth';

const Content = ({data}) => {
  const [users, setUsers] = useState({})
    useEffect(() => {
      GetUsers()
        .then(us => setUsers(us.reduce((map, u) => ({...map, [u.id]:u}), {})))
        .catch(console.log)
    }, [])
  return <TableBody>
    {
      data.map((d, i) => <TableRow key={`data_row_${i}`} >
        <TableCell>{i+1}</TableCell>
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
  </TableBody>
}

function DeletedData({ pathname }) {
  const [data, setData] = useState({})
  const [selectDate, setSelectDate] = useState(null)
  useEffect(() => {
    getDeletedRecord()
      .then(r => {
        setData(r);
        const d = Object.keys(r);
        setSelectDate(d.length > 0 ? d[0] : null)
      })
      .catch(console.log)
  }, [])
  return (<PageContainer>
      <PageHeaderToolbar>
        <OptSelect 
            data={Object.keys(data).map(k => ({name: k}))} 
            title={"選擇日期"}
            v={selectDate}
            fullWidth
            onSelect={e => {}}/>
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
                  <TableCell></TableCell>
              </TableRow>
          </TableHead>
          <Content data={selectDate ? data[selectDate] : []}/>
      </Table>
  </PageContainer>
  );
}

DeletedData.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default DeletedData;