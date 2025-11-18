
import * as React from 'react';
import PropTypes from 'prop-types';
import { PageContainer,PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { UpdateItems,GetItems } from '../../action/cfg';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
function ItemSetting({ pathname }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState("")
  useEffect(() => {
    GetItems()
      .then(setItems)
      .catch(console.log)
  }, [])

  return (<PageContainer  >
    <PageHeaderToolbar>
      <Button 
        color='success' 
        onClick={e => {
          UpdateItems(items)
            .then(console.log)
            .catch(console.log)
        }}>儲存(新增、修改、刪除都需要按這個案紐)</Button>
    </PageHeaderToolbar>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>項目</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>
              <TextField label="新增" 
                          variant="standard" 
                          value={newItem}
                          onChange={e => setNewItem(e.target.value)}/>
          </TableCell>
          <TableCell>
              <Button onClick={e => {
                if (newItem !== "" && (items.filter(f => f.name === newItem).length === 0)) setItems([{name: newItem},...items]);
                setNewItem("")
              }}>新增</Button>
          </TableCell>
        </TableRow>
        {
          items.map((item, i) => <TableRow key={`item_${i}`}>
            <TableCell>
              <TextField 
                variant="standard"
                onChange={e => {
                  const ni = items.map((it, index) => index === i ? {...it, name: e.target.value} : it)
                  setItems(ni)
                }}
                value={item.name}/>
            </TableCell>
            <TableCell>
              <Button color='error' onClick={e => {
                setItems(items.filter(f => f.name !== item.name))
              }}>刪除</Button>
            </TableCell>
          </TableRow>)
        }
      </TableBody>
    </Table>
  </PageContainer>
  );
}

ItemSetting.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default ItemSetting;