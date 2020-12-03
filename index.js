import { registerRootComponent } from 'expo';
import React from 'react';
import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import userReducer from './src/reducers/userReducer'

const store = createStore(userReducer, applyMiddleware(ReduxThunk))

const Root = () => {
    return(
        <Provider store={store}>
            <App />
        </Provider>
    )
}
registerRootComponent(Root);



// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately