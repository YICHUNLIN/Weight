import React, { createContext, useReducer} from 'react';
import {reducers} from './reducer'
import { useState } from 'react';
import { useContext } from 'react';
const AppContext = createContext({});
const initState = reducers()
const Provider = ({children}) => {
    const reducer = useReducer(reducers, initState)
    return <AppContext.Provider value={reducer}>
        {children}
    </AppContext.Provider>
}

const connect = (stateMap, funcMap) => {
    return (WrappedComponent) => () => {
        const [state, dispatch] = useContext(AppContext);
        const mapFunc = Object.keys(funcMap).reduce((map, key) => {
            return {...map, [key]: funcMap[key](dispatch)}
        }, {})
        return <WrappedComponent {...state} {...stateMap} {...mapFunc}/>
    }
}



const useGlobalContext = () => {
    return useContext(AppContext);
}
export {AppContext, Provider, connect, useGlobalContext};