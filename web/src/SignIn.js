import React, {useState} from 'react';
import {
  Avatar, Button, CssBaseline, TextField, 
  Link, Box, Typography, Container,
  Alert
} from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://www.kmn.tw">
      MD INFOR Ltd.
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignIn({onSignIn}) {
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState("")
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true)
    setErrMsg("")
    const data = new FormData(event.currentTarget);
    onSignIn({
      account: data.get('username'),
      password: data.get('password'),
    })
    .then(({isLogin}) => {
      setLoading(!isLogin)
    })
    .catch(({isLogin, err}) => {
      setErrMsg(err.message)
      setLoading(isLogin)
    })
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in {loading ? '(登入中...請稍候)' : ''}
          </Typography>
          {errMsg ? <Alert severity="error">{errMsg}</Alert> : ''}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="使用者姓名"
              name="username"
              autoFocus
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}
