
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
function NotFound({  }) {
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
      <Typography>404 Not Found Any Thing</Typography>
    </Box>
  );
}

export default NotFound;