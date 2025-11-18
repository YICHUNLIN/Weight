import auth from './auth';
import scale from './scale';
import combineReducer from './combineReducer';

const reducers = combineReducer({auth, scale});
export {reducers}