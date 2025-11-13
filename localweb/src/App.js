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

function App() {
  const [{auth:{isAuth}}, dispatch] = useContext(AppContext)
  const onSignInSuccess = (info) => {
    dispatch({type: 'SAVE_USER', payload: info})
  }

  return <div>
    {
        (isAuth === false) ? <SignIn onSuccess={onSignInSuccess}/> :<AppProvider/>
    }
  </div>
}


// function App() {
//   const [auth, setAuth] = useState(null)

//   return <AppContext.Provider value={{auth}}>
//       {
//         auth === null ? <SignIn onSuccess={info => {
//           setAuth(info)
//         }}/> :<AppProvider/>
//       }
//     </AppContext.Provider>
// }

export default App;
