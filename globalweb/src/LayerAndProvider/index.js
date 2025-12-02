import * as React from 'react';
import PropTypes from 'prop-types';
import { AppProvider } from '@toolpad/core/AppProvider'
// import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import GetNav from './navigation';
import DefaultTheme from './theme'
import Router from './route';
import { AppContext } from '../storage/context';
import { useContext } from 'react';
import { useEffect } from 'react';
import jungIcon from '../asserts/JA-192x192.png'
import { GetAppName } from '../action/cfg';
import { useState } from 'react';

function AppProviderBasic({ window, ...others }) {
  const [BRANDING, setBRANDING] = useState({
    logo: (
      <img
        src={jungIcon}
        alt="Jung"
        style={{ height: 24 }}
      />
    ),
    title: '金三榮地磅',
  })
  const [state, dispatch] = useContext(AppContext);
  const [session, setSession] = React.useState({
    user: {
      name: '',
      email: ''
    },
  });
  useEffect(() => {
    const {auth} = state;
    setSession({...session, user: {name: auth.user?.name, email: auth.user?.email}})
    GetAppName()
      .then(name => setBRANDING({...BRANDING, title: name}))
      .catch(console.log)
  }, [state.auth])
  const authentication = React.useMemo(() => {
    return {
      signOut: () => {
        setSession(null);
        dispatch({type: 'DELETE_USER'})
      },
    };
  }, []);

  const router = useDemoRouter('/');

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <AppProvider
        session={session}
        navigation={GetNav(state.auth.user.permissions.map(p => p.name))}
        branding={BRANDING}
        router={router}
        theme={DefaultTheme}
        window={demoWindow}
        authentication={authentication}
      >
        <DashboardLayout>
          <Router pathname={router.pathname}  {...others} />
        </DashboardLayout>
      </AppProvider>
  );
}

AppProviderBasic.propTypes = {
  window: PropTypes.func,
};

export default AppProviderBasic;
