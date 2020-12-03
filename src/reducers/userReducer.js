import { combineReducers } from 'redux';

const INITIAL_STATE = {
    userInfo:{}
};

const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {

        case 'SET_USER_INFO': 
            return {
                ...state,
                userInfo: action.payload,
            }   

        default:
            return state
    }
};

export default combineReducers({
    userReducer,
});