
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { connect } from '../../storage/context';
import { PageContainer,PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
const items = [
  {
    version: 'Beta-0.1',
    content: '進料模式',
    updatedAt: '2025/12/12',
    updatedBy: '林逸群'
  },
  {
    version: 'Beta-0.04',
    content: '取得地磅資料',
    updatedAt: '2025/12/03',
    updatedBy: '林逸群'
  },
  {
    version: 'Beta-0.03',
    content: '更新IP自動選擇伺服器的功能,',
    updatedAt: '2025/12/02',
    updatedBy: '林逸群'
  },
  {
    version: 'Beta-0.02',
    content: '(1)更新Excel輸出:加入貨物說明 (2)新增功能:新增時可選擇儲存車輛資訊,下次輸入(當日)可以自動帶入',
    updatedAt: '2025/11/20',
    updatedBy: '林逸群'
  },
  {
    version: 'Beta-0.01',
    content: '初次上線',
    updatedAt: '2025/11/20',
    updatedBy: '林逸群'
  }
]
const Home = ({ pathname, ...others }) => {
  return (
    <PageContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>版本</TableCell>
            <TableCell>更新日期</TableCell>
            <TableCell>更新項目</TableCell>
            <TableCell>更新者</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            {
              items.map((it, i) => <TableRow key={`row_${i}`}>
                <TableCell>{it.version}</TableCell>
                <TableCell>{it.updatedAt}</TableCell>
                <TableCell>{it.content}</TableCell>
                <TableCell>{it.updatedBy}</TableCell>
              </TableRow>)
            }
            
        </TableBody>
      </Table>
    </PageContainer>
  );
}

Home.propTypes = {
  pathname: PropTypes.string.isRequired,
};

const mapProp = () => {
  return {

  }
}

export default connect(mapProp,{})(Home);