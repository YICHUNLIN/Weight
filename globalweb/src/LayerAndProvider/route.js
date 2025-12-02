import React from "react";
import Home from "../components/Home";
import ScaleToday from "../components/ScaleToday";
import NotFound from "../components/NotFound";
import History from "../components/History";
import ItemSetting from "../components/ItemSetting";
import DeletedData from "../components/DeletedData";
import { useContext } from "react";
import { AppContext } from "../storage/context";
const routes = [
    {
        path: '/',
        component: <Home/>
    },
    {
        path: '/scale/today',
        component: <ScaleToday/>
    },
    {
        path: '/scale/history',
        component: <History/>
    },
    {
        path: '/scale/deleted',
        allow: 'SCALE_MAMAGE_DELETE',
        component: <DeletedData/>
    },
    {
        path: '/setting/items',
        allow: 'SCALE_SETTING_CONFIG',
        component: <ItemSetting/>
    }
]

const Router = ({pathname, ...props}) => {
    const [state] = useContext(AppContext);
    const doRoute = () => {
        const pms = state.auth.user.permissions.map(p => p.name);
        const targets = routes
                            .filter(r => r.path === pathname)
                            .filter(r => !r.allow ? true : pms.includes(r.allow));
        if (targets.length > 0) return React.cloneElement(targets[0].component, {...props})
        return <NotFound/>
    }
    return <>{doRoute()}</>
}

export default Router