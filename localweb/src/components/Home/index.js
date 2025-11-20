
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