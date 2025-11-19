
import * as React from 'react';
import PropTypes from 'prop-types';
import {Table,TableHead,TableRow,TableCell,TableBody, Tooltip, Button} from '@mui/material';
import { PageContainer,PageHeaderToolbar } from '@toolpad/core/PageContainer';
import Create from './create';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useState } from 'react';
import { findDataByDate, deleteRecord } from '../../action/scale';
import { useEffect } from 'react';
import { useGlobalContext } from '../../storage/context';
import Update from './update';
import { GetUsers } from '../../action/auth';
import { GetItems } from '../../action/cfg';
import DeleteDialog from './delete';

const ActionOptios = ({d, user, onUpdate, onDelete, items}) => {
  return <TableCell>
    
    {d.createdBy === user.id ? <Update value={d} onUpdate={onUpdate} items={items}/> : ""}
    {d.createdBy === user.id ? <DeleteDialog onDelete={onDelete}/> : ""}
  </TableCell>
}


function ScaleToday({ pathname }) {
  const [{scale, auth: {user}}, dispatch] = useGlobalContext()
  const [today] = useState((new Date()).toISOString().split('T')[0])
  const [data, setData] = useState([])
  const [users, setUsers] = useState({})
  const [items, setItems] = useState([])

  const getData = () => {
    findDataByDate(today)
      .then(setData)
      .catch(console.log)
  }

  useEffect(() => {
    getData()
  }, [today])

  useEffect(() => {
    GetUsers()
      .then(us => setUsers(us.reduce((map, u) => ({...map, [u.id]:u}), {})))
      .catch(console.log)
    GetItems()
      .then(setItems)
      .catch(console.log)
  }, [])
  return (<PageContainer title={today}>
      <PageHeaderToolbar>
        <Create 
          items={items}
          onUpdate={e => {
            getData()
          }}/>
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
          <TableBody>
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
                <ActionOptios 
                  d={d} 
                  user={user}
                  onDelete={() => {
                    deleteRecord(d.createdAt.split('T')[0],d.id)
                      .then(r => getData())
                      .catch(console.log)
                  }}
                  onUpdate={e => getData()} 
                  items={items}/>
              </TableRow>)
            }
          </TableBody>
      </Table>
  </PageContainer>
  );
}

ScaleToday.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default ScaleToday;