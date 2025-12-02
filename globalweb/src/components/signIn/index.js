
import { SignInPage} from '@toolpad/core/SignInPage';
import { GetTicket } from '../../action/auth';
import {
  InputAdornment,Alert,Button,
  TextField} from '@mui/material'
import AccountCircle from '@mui/icons-material/AccountCircle';
import KeyIcon from '@mui/icons-material/Key';
import { useTheme } from '@mui/material/styles';
const providers = [
  { id: 'credentials', name: 'Jung`s ODS key' }
];

function CustomAccountField() {
  return (
    <TextField
      label="帳號"
      name="account"
      type="text"
      size="small"
      required
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle fontSize="inherit" />
            </InputAdornment>
          ),
        },
      }}
      variant="outlined"
    />
  );
}

function CustomPasswordField() {
  return (
    <TextField
      label="密碼"
      name="password"
      type="password"
      size="small"
      required
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <KeyIcon fontSize="inherit" />
            </InputAdornment>
          ),
        },
      }}
      variant="outlined"
    />
  );
}
function Title() {
  return <h2 style={{ marginBottom: 8 }}>金三榮地磅系統</h2>;
}

function Subtitle() {
  return (<>請使用文件系統帳號</>);
}
function CustomButton() {
  return (
    <Button
      type="submit"
      variant="outlined"
      color="info"
      size="small"
      disableElevation
      fullWidth
      sx={{ my: 2 }}
    >
      登入
    </Button>
  );
}
const SignIn = ({onSuccess}) => {
    return <SignInPage 
              signIn={(provider, formData) => {
                return new Promise((resolve) => {
                  GetTicket({account: formData.get('account'), password: formData.get('password')})
                      .then((d) => {
                          onSuccess(d)
                          resolve({success: "OK"})
                      }).catch(err => resolve({error: err.message}))
                });
              }} 
              slots={{
                title: Title,
                subtitle: Subtitle,
                emailField: CustomAccountField,
                submitButton: CustomButton,
                passwordField: CustomPasswordField
              }}
              providers={providers} /> 
}

export default SignIn