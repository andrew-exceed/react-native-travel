import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import * as firebase from 'firebase'

import { 
    useDispatch,
} from 'react-redux';
import userActions from '../actions/userActions'

export const LoadingScreen = ({ navigation }) => {
    const [ isLoading, setIsLoading ] = useState(true);
    const dispatch = useDispatch();

    useEffect(()=>{
        checkIfLoggedIn();
    })

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged(user => {
            if (user){
                dispatch(userActions.setUserInfoAction(user));
                navigation.navigate('TravelList');
                // СreateTravel
                // TravelList
            } else {
                navigation.navigate('Login');
            }
            setIsLoading(false)
        })
    }

    return (
        <View style={styles.container}>
            <Spinner 
                visible={isLoading}
                textContent={'Loading'}
                textStyle={styles.spinnerTextStyle}
            />
        </View>
    )
}

export default LoadingScreen;

const styles = StyleSheet.create({
    spinnerTextStyle: {
        color: '#FFF'
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})