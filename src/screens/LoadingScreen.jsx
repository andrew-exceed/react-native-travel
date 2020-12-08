import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import * as firebase from 'firebase'
import { StackActions } from '@react-navigation/native';
import { 
    useDispatch,
} from 'react-redux';
import userActions from '../actions/userActions'

export const LoadingScreen = ({ navigation }) => {
    const dispatch = useDispatch();

    useEffect(()=>{
        let cleanupFunction = false;
        if(!cleanupFunction){
            checkIfLoggedIn();
        }
        return () => cleanupFunction = true;
    }, [])

    const checkIfLoggedIn = () => {
        firebase.auth().onAuthStateChanged(user => {
            if (user){
                dispatch(userActions.setUserInfoAction(user));
                navigation.dispatch(StackActions.replace('TravelList'));
            } else {
                navigation.dispatch(StackActions.replace('Login'));
            }
        })
    }

    return (
        <View style={styles.container}>
            <Spinner 
                visible={true}
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