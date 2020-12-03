import React, { useState } from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { Button } from '@ant-design/react-native';
import * as Google from 'expo-google-app-auth';
import * as firebase from 'firebase';

export const LoginScreen = () => {
    const [ isLoading, setIsLoading ] = useState(false);

    const isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()) {
                    // We don't need to reauth the Firebase connection.
                    return true;
                }
            }
        }
        return false;
    }

    const onSignIn = (googleUser) => {
        // console.log('Google Auth Response', googleUser);
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(
                    googleUser.idToken,
                    googleUser.accsessToken
                );
        
            // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential)
            .then((result) => {
                // console.log('user sigin123');
                setIsLoading(false);
                if (result.additionalUserInfo.isNewUser) {
                    firebase.database().ref('/users' + result.user.uid)
                    .set({
                        gmail: result.user.email,
                        profile_picture: result.additionalUserInfo.profile.picture, 
                        locale: result.additionalUserInfo.profile.locale, 
                        first_name: result.additionalUserInfo.profile.given_name, 
                        last_name: result.additionalUserInfo.profile.family_name, 
                        created_at: Date.now(),
                    })
                    .then((snapshot) => {
                        // console.log('snapshot', snapshot)
                    });
                } else {
                    firebase.database().ref('/users' + result.user.uid)
                    .update({
                        last_logged_in: Date.now(),
                    })
                }
                
            }).catch((error) => {
                setIsLoading(false);
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
            });
            } else {
            // console.log('User already signed-in Firebase.');
            }
        });
    }
    
    const signInWithGoogleAsync = async () => {
        setIsLoading(true);
        try {
            const result = await Google.logInAsync({
                // behavior: 'web',
                androidClientId: '381615090176-11rmbb7hctt6mhegieett5jgd50ba913.apps.googleusercontent.com',
                // iosClientId: YOUR_CLIENT_ID_HERE,
                scopes: ['profile', 'email'],
            });
        
            if (result.type === 'success') {
                onSignIn(result);
                return result.accessToken;
            } else {
                return { cancelled: true };
            }
        } catch (e) {
            return { error: true };
        }
    }
    
    return (
        <View style={styles.container}>
            <Spinner 
                visible={isLoading}
                textContent={'Loading'}
                textStyle={styles.spinnerTextStyle}
            />
            <Button
                onPress={() => {signInWithGoogleAsync(); }}
            > 
                Login with google
            </Button>
        </View>
    )
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerTextStyle: {
        color: '#FFF'
    },
})