
import * as React from 'react';
import PropTypes from 'prop-types';
import {Table,TableHead,TableRow,TableCell,TableBody, Tooltip, Button, Typography, Card, CardContent} from '@mui/material';
import { PageContainer,PageHeaderToolbar } from '@toolpad/core/PageContainer';
import Create from './create';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useState } from 'react';
import { findDataByDate, deleteRecord, getSupplementaryData } from '../../action/scale';
import { useEffect } from 'react';
import { useGlobalContext } from '../../storage/context';
import Update from './update';
import { GetUsers } from '../../action/auth';
import { GetDailyConfig, GetItems, GetScale } from '../../action/cfg';
import DeleteDialog from './delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

const Content = ({date, data, users}) => {
  const [open, setOpen] = useState(true)
  useEffect(() => console.log(data), [data])
  return <>
    <TableRow>
      <TableCell colSpan={10}>
        {date}
        <Button onClick={e => setOpen(!open)}>
          {open ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}
        </Button> 
      </TableCell>
    </TableRow>
    {
      open ? data.map((d, i) => <TableRow key={`${date}_${i}`}>
        <TableCell>{i+1} )</TableCell>
        <TableCell style={{ backgroundColor: d.inorout !== "INPORT" ? "#ff8400ff" : "#14cc76ff" }} >
          {d.inorout === "INPORT" ? "進場" : "出場"}
        </TableCell>
        <TableCell>{d.client} / {d.source_or_destination}</TableCell>
        <TableCell>{d.item} / {d.desc}</TableCell>
        <TableCell>{d.number}</TableCell>
        <TableCell>{d.empty}</TableCell>
        <TableCell>{d.car} / {d.driver}</TableCell>
        <TableCell>{d.ptime}</TableCell>
        <TableCell>{d.createdAt}</TableCell>
        <TableCell>{!users.hasOwnProperty(d.createdBy) ? "---" : users[d.createdBy].account}</TableCell>
      </TableRow>) : ''
    }
  </>
}


function Supplementary({ pathname }) {
  const [{scale, auth: {user}}, dispatch] = useGlobalContext()
  const [today] = useState((new Date()).toISOString().split('T')[0])
  const [data, setData] = useState({})
  const [users, setUsers] = useState({})
  const [items, setItems] = useState([])
  const [dc, setDailyConfig] = useState({})
  const [scaleState, setScaleState] = useState({})

  const getData = () => {
    getSupplementaryData()
      .then(setData)
      .catch(console.log)
  }

  useEffect(() => {
    getData()
  }, [])

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
          dc={dc}
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
                  <TableCell>事件時間</TableCell>
                  <TableCell>補件時間</TableCell>
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

Supplementary.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default Supplementary;