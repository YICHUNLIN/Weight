import { applyMiddleware} from 'redux'
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk'; // 用來做非同步的 dispatch
import auth from './reducer/auth';
export default configureStore({reducer: {
    auth
}}, applyMiddleware(thunk));