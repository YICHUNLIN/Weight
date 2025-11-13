import React, { createContext, useReducer} from 'react';
import {reducers} from './reducer'
import { useState } from 'react';
const AppContext = createContext({});
const initState = reducers()
const Provider = ({children}) => {
    const reducer = useReducer(reducers, initState)
    return <AppContext.Provider value={reducer}>
        {children}
    </AppContext.Provider>
}

export {AppContext, Provider};