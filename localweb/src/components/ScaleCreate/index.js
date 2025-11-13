
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
function ScaleCreate({ pathname }) {
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
      <Typography>Dashboard content for {pathname} , AAAAA</Typography>
    </Box>
  );
}

ScaleCreate.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default ScaleCreate;