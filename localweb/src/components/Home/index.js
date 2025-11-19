
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { connect } from '../../storage/context';
import { PageContainer,PageHeaderToolbar } from '@toolpad/core/PageContainer';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
const Home = ({ pathname, ...others }) => {
  return (
    <PageContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>更新日期</TableCell>
            <TableCell>更新項目</TableCell>
            <TableCell>更新者</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
            
        </TableBody>
      </Table>
    </PageContainer>
  );
}

Home.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default Home;