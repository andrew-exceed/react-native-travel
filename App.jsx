import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useFonts } from 'expo-font';
import { AppLoading } from 'expo';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

import { 
  useSelector,
  useDispatch,
} from 'react-redux';
import userActions from './src/actions/userActions'

import GeneralStatusBarColor from './src/mainStyles/GeneralStatusBarColor';
import LoadingScreen from './src/screens/LoadingScreen';
import LoginScreen from './src/screens/LoginScreen';
import TravelListScreen from './src/screens/TravelListScreen';
import CreateTravelScreen from './src/screens/CreateTravelScreen';

import * as firebase from 'firebase';
import { firebaseConfig } from './src/config';
if (!firebase.apps.length) {firebase.initializeApp(firebaseConfig)};

import colorConstants from './src/mainStyles/colorConstants'
const {grey, black, white, lightBlack, dark} = colorConstants;

const Stack = createStackNavigator();
const MyTheme = {
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: lightBlack,
  },
};


export const App = () => {
  let [fontsLoaded] = useFonts({
    'antoutline': require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
  });
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.userReducer.userInfo);
  const navigationRef = React.createRef();

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        dispatch(userActions.setUserInfoAction(user))
      }
    });
  }, [])

  const HeaderButtons = ({hasNewBttn = false}) => (
    <View style={styles.headerBtns}>
      {hasNewBttn &&
        <TouchableOpacity
          onPress={() => {navigationRef.current.navigate('СreateTravel')}}
          style={styles.logout}
        >
          <MaterialCommunityIcons name="plus-box-outline" size={29} color={white} />
        </TouchableOpacity>
      }
      <TouchableOpacity
        onPress={() => firebase.auth().signOut()}
        style={styles.logout}
      >
        <MaterialCommunityIcons name="logout-variant" size={29} color={white} />
      </TouchableOpacity>
    </View>
  )
  return (
      <>
        <GeneralStatusBarColor backgroundColor={lightBlack} barStyle="light-content"/>

        {fontsLoaded ?
            <NavigationContainer theme={MyTheme} ref={navigationRef}>
              <Stack.Navigator 
                initialRouteName="Loading"
                screenOptions={{
                  gestureEnabled: true,
                  headerStyle: {
                    backgroundColor: lightBlack
                  },
                  headerTitleStyle: {
                    fontWeight: 'bold'
                  },
                  headerTintColor: white,
                }}
              >

                <Stack.Screen 
                  name="Loading"
                  component={LoadingScreen}
                  options={() => ({
                    headerLeft: null,
                    gestureEnabled: false,
                  })}
                />
                <Stack.Screen 
                  name="Login" 
                  component={LoginScreen} 
                  options={() => ({
                    headerLeft: null,
                    gestureEnabled: false,
                  })}
                />
                <Stack.Screen 
                  name="СreateTravel" 
                  component={CreateTravelScreen} 
                  options={() => ({
                    title: 'Новая поездка',
                    gestureEnabled: false,
                    headerLeft: null,
                    headerRight:() => <HeaderButtons />,
                  })}
                />
                <Stack.Screen 
                  name="TravelList" 
                  component={TravelListScreen} 
                  options={() => ({
                    title: userInfo.displayName,
                    gestureEnabled: false,
                    headerLeft: null,
                    headerRight:() => <HeaderButtons hasNewBttn={true} />,
                  })}
                />

              </Stack.Navigator>
            </NavigationContainer>
        :
          <AppLoading />

        }
      </>
  );
}
export default App;

const styles = StyleSheet.create({
  logout: {
    marginRight: 10,
  },
  headerBtns: {
    flexDirection: 'row',
  }
})