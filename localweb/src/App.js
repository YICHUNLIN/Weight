import logo from './logo.svg';
import './App.css';
import AppProvider from './LayerAndProvider';
import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import NAVIGATION from './LayerAndProvider/navigation';
import SignIn from './components/signIn';
import { useState } from 'react';
import { AppContext, Provider } from './storage/context';
import { useContext } from 'react';
import {doTicketLogin} from './action/auth';
import WSClient from './wsclient';
function App() {
  const [{auth:{isAuth}}, dispatch] = useContext(AppContext)
  const [intervalId, setintervalId] = useState(null)

  const clearUser = () => {
    clearInterval(intervalId)
    dispatch({type: 'DELETE_USER'});
    setintervalId(null)
  }
  const onSignInSuccess = (info) => {
    dispatch({type: 'SAVE_USER', payload: info})
  }

  useEffect(() => {
    if (isAuth){
      doTicketLogin()
          .then(r => console.log('check ticket successed'))
          .catch(err => clearUser())
      const intervalId = setInterval(() => {
        doTicketLogin()
          .then(r => console.log('check ticket successed'))
          .catch(err => clearUser())
      }, 1000*60*30)
      setintervalId(intervalId)
    }
    const id = "OOOOO"
    const name = "XXXXX"
    const client = new WSClient(
      {
        url: 'ws://192.168.0.198:9876', 
        id, 
        name
      }, args => console.log(args))
  }, [])

  return <div>
    {
        (isAuth === false) ? <SignIn onSuccess={onSignInSuccess}/> :<AppProvider/>
    }
  </div>
}

export default App;
