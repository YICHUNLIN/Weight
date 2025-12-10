
import * as React from 'react';
import PropTypes from 'prop-types';
import { PageContainer,PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography,Card, CardContent } from '@mui/material';
import { useEffect,useState } from 'react';
import OptSelect from '../com/OptSelect';
import { GetDailyConfig, GetItems,GetScale } from '../../action/cfg';
import { findDataByDate, deleteRecord } from '../../action/scale';
import DefaultValues from './defaultValues';
import OptFields from './optFields';
import { createRecord } from '../../action/scale';
import { GetUsers } from '../../action/auth';


const defaultV = {
    item: "",
    inorout: "INPORT",
    source_or_destination: "",
    client: "",
}
const initFormData = {
    number: 0,
    empty: 0,
    driver: "外車",
    car: "",
    desc: "",
    carInfo: true
  };

const Status = ({scaleState}) => {
  if (scaleState.error)
    return <Card style={{ backgroundColor: "red" }}>
      <CardContent>
        <Typography  sx={{ color: 'text.secondary', fontSize: 20 }}>
          取得地磅資料失敗
        </Typography>
      </CardContent>
    </Card>
  return <Card sx={{ minWidth: 275 }} style={{ backgroundColor: scaleState.isStable === true ? "green" : "red" }}>
      <CardContent>
        <Typography  sx={{ color: 'text.secondary', fontSize: 20 }}>
          地磅狀態
        </Typography>
        <Typography variant="h5" component="div">
          {scaleState.weight} {scaleState.unit}
        </Typography>
      </CardContent>
    </Card>
}
function ImportMode({ pathname }) {
  const [carInfo, setCarInfo] = useState({})
  const [defalutValue, setDefaultValue] = useState(defaultV)
  const [formData, setFormData] = React.useState(initFormData);
  const [users, setUsers] = useState({})

  const [today] = useState((new Date()).toISOString().split('T')[0])
  const [scaleState, setScaleState] = useState({})
  const [list, setList] = useState([]);
  const getData = () => {
        findDataByDate(today)
          .then(setList)
          .catch(console.log)
  }

  useEffect(() => {

    GetUsers()
      .then(us => setUsers(us.reduce((map, u) => ({...map, [u.id]:u}), {})))
      .catch(console.log)
    setInterval(() => {
      GetScale()
        .then(s => {
          setFormData({number: s.weight})
          setScaleState(s.data);
        })
        .catch(err => {
          setScaleState({error: '取得地磅資料失敗!'});
        })
    }, 1000)
    setDefaultValue({...defalutValue, ...getStorageInfo("IMPORT_MODE")})
    setCarInfo(getStorageInfo("IMPORT_MODE_CAR_INFO"));
    getData()
  }, [])

  const getStorageInfo = (key) => {
      let storageValue = localStorage.getItem(key);
      if (!storageValue) storageValue = {};
      else storageValue = JSON.parse(storageValue);
      return storageValue;
  }
  const onUpdateCarInfo = (v) => {
    const key = "IMPORT_MODE_CAR_INFO";
    let storageValue = getStorageInfo(key);
    storageValue = {...storageValue, ...v}
    localStorage.setItem(key, JSON.stringify(storageValue))
    setCarInfo(storageValue)
  }
  const onUpdateDefaultValues = (v) => {
    const key = "IMPORT_MODE";
    let storageValue = getStorageInfo(key);
    storageValue = {...storageValue, ...v}
    localStorage.setItem(key, JSON.stringify(storageValue))
    setDefaultValue({...defalutValue, ...v})
  }

  return (<PageContainer  >
    <PageHeaderToolbar>
      <DefaultValues fd={defalutValue} onUpdate={e => onUpdateDefaultValues(e)}/>
      <OptFields fd={formData} onUpdate={e => {
        if (e.car){
          const key = "IMPORT_MODE_CAR_INFO";
          let storageValue = getStorageInfo(key);
          if (storageValue.hasOwnProperty(e.car)) 
            e = {...e, ...storageValue[e.car]};
        }
        setFormData({...formData, ...e})
      }} scaleStat={scaleState}/>
    </PageHeaderToolbar>
    <PageHeaderToolbar>
      <Button onClick={e => {
        onUpdateCarInfo({[formData.car]: {empty: formData.empty, driver: formData.driver}})
        createRecord({...formData,...defalutValue, mode: 'IMPORT'})
          .then(r => {
            setFormData(initFormData);
            getData();
          }).catch(console.log)
      }}>新增</Button>
    </PageHeaderToolbar>
    <Status scaleState={scaleState}/>
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
              list.map((d, i) => <TableRow key={`data_row_${i}`} >
                <TableCell>{i+1}</TableCell>
                <TableCell style={{ backgroundColor: d.inorout !== "INPORT" ? "#ff8400ff" : "#14cc76ff" }} >
                  {d.inorout === "INPORT" ? "進場" : "出場"}
                </TableCell>
                <TableCell>{d.client} / {d.source_or_destination}</TableCell>
                <TableCell>{d.item} / {d.desc}</TableCell>
                <TableCell>{d.number}</TableCell>
                <TableCell>{d.empty}</TableCell>
                <TableCell>{d.car} / {d.driver}</TableCell>
                <TableCell>{ (new Date(d.createdAt)).toLocaleTimeString()}</TableCell>
                <TableCell>{!users.hasOwnProperty(d.createdBy) ? "---" : users[d.createdBy].account}</TableCell>
                
              </TableRow>)
            }
        </TableBody>
    </Table>
  </PageContainer>
  );
}

ImportMode.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default ImportMode;