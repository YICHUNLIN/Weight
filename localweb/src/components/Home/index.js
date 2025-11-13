
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useContext } from 'react';
function Home({ pathname, ...others }) {
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
      <Typography>Dashboard content for {pathname}, Home, Home</Typography>
    </Box>
  );
}

Home.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default Home;