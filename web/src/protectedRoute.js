
import React, { } from 'react';
import { Route } from 'react-router-dom';

const ProtectedRoute = ({path, children, allow}) => {
    return <>
        {
            allow ? <Route path={path}>{children}</Route> : <></>
        }
    </>
}

export default ProtectedRoute;