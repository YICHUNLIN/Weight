
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { connect } from '../../storage/context';
const SystemInit = ({ pathname, ...others }) => {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}, Home, Hi  </Typography>
    </Box>
  );
}

SystemInit.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default SystemInit;