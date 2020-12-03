import React, { useState, useEffect } from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { 
    useSelector,
} from 'react-redux';
import { Button } from '@ant-design/react-native';
import Autocomplete from 'react-native-autocomplete-input';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';
import * as firebase from 'firebase';


import getCities from '../api/citiesListService'

import colorConstants from '../mainStyles/colorConstants'
const {grey, black, white, lightBlack, dark} = colorConstants;

export const CreateTravelScreen = ({ navigation }) => {
    const [citiesList, setCitiesList] = useState([]);

    const [chosenCity, setChosenCity] = useState(null);
    const [chosenDate, setChosenDate] = useState(new Date());
    const [typeTravel, setTypeTravel] = useState({city: false, nature: false});

    const [showDataPicker, setShowDataPicker] = useState(false);
    const userInfo = useSelector(state => state.userReducer.userInfo);

    const cityInputChangeHandler = async (text) => {
        setChosenCity(text);
        const data = await getCities(text);
        setCitiesList(data);
    }

    const onChange = (_, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDataPicker(Platform.OS === 'ios');
        setChosenDate(currentDate);
    };

    const createTravel = () => {
        if (!chosenCity){return null}
        let newTravel = firebase.database().ref(`/users${userInfo.uid}/travels`).push()
        newTravel.set({
            city: chosenCity, 
            dateTravel: ""+new Date(chosenDate),
            typeTravel: typeTravel,
        });
        navigation.navigate('TravelList');
    }

    const changeTravelType = (type) => {
        switch (type) {
            case 'city': 
                {   
                    console.log(type)
                    setTypeTravel({
                        ...typeTravel,
                        city: !typeTravel.city,
                    })
                    break;
                }
            case 'nature': 
                {
                    
                    setTypeTravel({
                        ...typeTravel,
                        nature: !typeTravel.nature,
                    })
                    break;
                }
            default: 
                {}
        }
    }

    return (
        <View style={styles.container}>

            <Autocomplete
                listContainerStyle={{
                    width: '100%',
                }}
                listStyle={{
                    width: '100%',
                    margin: 0,
                }}
                inputContainerStyle={{
                    
                }}
                placeholder='City'
                data={citiesList.length ? citiesList.slice(0, 6) : []}
                value={chosenCity}
                defaultValue={''}
                onChangeText={text => cityInputChangeHandler(text)}
                keyExtractor={(_, i) => {return i +""}}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        onPress={() => {setChosenCity(item?.name); setCitiesList([])}}
                        style={styles.autocompleteItem}
                    >
                        <Text style={styles.autocompleteItemText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />

            <View style={styles.checkBoxContainer}>
                <TouchableOpacity 
                    style={[styles.typeCheckbox, (typeTravel.city && styles.typeCheckboxActive)]}
                    onPress={() => {changeTravelType('city')}}
                >
                    <Text>Город</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.typeCheckbox, (typeTravel.nature && styles.typeCheckboxActive)]}
                    onPress={() => {changeTravelType('nature')}}
                >
                    <Text>Природа</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.checkBoxContainer}>
                <Button onPress={() => setShowDataPicker(true)}> 
                    {moment(chosenDate).format('MMMM: DD: YYYY')}
                </Button>
            </View>

            {showDataPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={chosenDate}
                    mode='date'
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                    minimumDate={new Date()}
                />
            )}

            <Button
                onPress={() => {createTravel()}}
            > 
                Create
            </Button>

        </View>
    );
}

export default CreateTravelScreen;

const styles = StyleSheet.create({
    container:{
        flex: .96,
        paddingHorizontal: 5,
        justifyContent: 'flex-start',
    },
    autocompleteItem: {
        paddingLeft: 5,
        paddingRight: 5,
        height: 30,
        justifyContent: 'center',
        borderBottomColor: dark,
        borderBottomWidth: 1,
    },
    autocompleteItemText: {
        fontSize: 17,
        color: lightBlack,
    },
    checkBoxContainer: {
        width: '100%',
        height: 75,
        flexDirection: 'row',
        justifyContent: 'space-around',
        flex: 1,
        paddingHorizontal: 5,
    },
    typeCheckbox: {
        height: 70,
        width: 70,
        backgroundColor: grey,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeCheckboxActive:{
        borderColor: white,
        borderWidth: 2,
    }
})