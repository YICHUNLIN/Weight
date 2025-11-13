import React from "react";
import Home from "../components/Home";
import ScaleCreate from "../components/ScaleCreate";
import NotFound from "../components/NotFound";

const routes = [
    {
        path: '/',
        component: <Home/>
    },
    {
        path: '/scale/create',
        component: <ScaleCreate/>
    }
]

const Router = ({pathname, ...props}) => {

    const doRoute = () => {
        const targets = routes.filter(r => r.path === pathname);
        if (targets.length > 0) return React.cloneElement(targets[0].component, {...props})
        return <NotFound/>
    }
    return <>{doRoute()}</>
}

export default Router