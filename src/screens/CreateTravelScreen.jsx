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
        firebase.database().ref(`/defaultSets`).on('value', (snap)=>{
            let i = 0;
            let itemList = [];
            const resp = snap.val();
            for (let key in resp){
                itemList[i] = {
                    title: resp[key].title,
                    type: resp[key].type,
                    data: resp[key].data,
                }
                i++;
            }
            if (!typeTravel.city) {
                let index = itemList.findIndex(item => item.type === 'city')
                itemList.splice(index, 1)
            }
            if (!typeTravel.nature) {
                let index = itemList.findIndex(item => item.type === 'nature')
                itemList.splice(index, 1)
            }
            itemList.map((_, index) => {itemList[index].id = index})
            let newTravel = firebase.database().ref(`/users${userInfo.uid}/travels`).push();
            newTravel.set({
                city: chosenCity, 
                dateTravel: ""+new Date(chosenDate),
                typeTravel: typeTravel,
                data: itemList,
            });
            navigation.navigate('TravelList');
        });

        // let newTravel = firebase.database().ref(`/users${userInfo.uid}/travels`).push()
        // newTravel.set({
        //     city: chosenCity, 
        //     dateTravel: ""+new Date(chosenDate),
        //     typeTravel: typeTravel,
        // });
        // navigation.navigate('TravelList');
        // let newTravel = firebase.database().ref(`/defaultSets`).push()
        // newTravel.set({
        //     title: 'nature set',
        //     type: 'nature',
        //     data: [
        //         {
        //             text: 'палатка',
        //             selected: false,
        //         },
        //         {
        //             text: 'котелок',
        //             selected: false,
        //         },
        //         {
        //             text: 'кот',
        //             selected: false,
        //         }
        //     ]
        // });
    }

    const changeTravelType = (type) => {
        switch (type) {
            case 'city': 
                {   
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
            <View style={styles.autocompleteContainerForPosition}></View>
            <View style={styles.autocompleteContainer}>
                <Autocomplete
                    listStyle={{
                        width: '100%',
                        margin: 0,
                        zIndex:99,
                    }}
                    placeholder='City'
                    data={citiesList.length ? citiesList.slice(0, 6) : []}
                    value={chosenCity}
                    defaultValue={''}
                    onChangeText={text => cityInputChangeHandler(text)}
                    keyExtractor={(_, i) => i+''}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            onPress={() => {setChosenCity(item?.name); setCitiesList([])}}
                            style={styles.autocompleteItem}
                        >
                            <Text style={styles.autocompleteItemText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    onBlur={() => setCitiesList([])}
                />
            </View>
            <View style={styles.boxContainer}>
                <Button style={styles.myBtn} onPress={() => setShowDataPicker(true)}> 
                    {moment(new Date(chosenDate)).format('MMMM: DD: YYYY')}
                </Button>
            </View>

            <View style={styles.boxContainer}>
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
            <View style={styles.boxContainer}>
                <Button style={styles.myBtn} onPress={() => {createTravel()}}>Create</Button>
            </View>
        </View>
    );
}

export default CreateTravelScreen;

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: 5,
        justifyContent: 'flex-start',
    },
    autocompleteContainerForPosition:{
        flex: 1,
        position: 'relative'
    },
    autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 99,
    },
    myBtn: {
        width: '100%'
    },
    autocompleteItem: {
        position: "relative",
        paddingLeft: 5,
        paddingRight: 5,
        height: 35,
        justifyContent: 'center',
        borderBottomColor: dark,
        borderBottomWidth: 1,
    },
    autocompleteItemText: {
        fontSize: 17,
        color: lightBlack,
    },
    boxContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    typeCheckbox: {
        height: 90,
        width: '48%',
        backgroundColor: grey,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeCheckboxActive:{
        borderColor: white,
        borderWidth: 2,
    }
})