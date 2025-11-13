
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useContext } from 'react';
import { AppContext } from '../../storage/context';
function Home({ pathname, ...others }) {
  const [state, dispatch] = useContext(AppContext);
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
      <Typography>Dashboard content for {pathname}, Home, Hi ~ {state.auth.user?.name} </Typography>
    </Box>
  );
}

Home.propTypes = {
  pathname: PropTypes.string.isRequired,
};

export default Home;