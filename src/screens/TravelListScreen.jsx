import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    View,
    ScrollView,
} from 'react-native';
import { Button } from '@ant-design/react-native';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import colorConstants from '../mainStyles/colorConstants';
import * as firebase from 'firebase';
import moment from 'moment-timezone'
import getWeather from '../api/weatherService';
import { 
    useSelector,
} from 'react-redux';

export const TravelListScreen = ({ navigation }) => {
    const [ weatherInfo, setWeatherInfo ] = useState({});
    const [ activeCityNumber, setActiveCityNumber ] = useState(0);
    const [ travelsList, setTravelsList ] = useState([1])
    const [ isDisabledScreen, setIsDisabledScreen ] = useState(false)
    const [listData, setListData] = useState(
        Array(2)
            .fill('')
            .map((_, i) => ({
                title: `Список ${i + 1}`,
                data: [
                    ...Array(4)
                        .fill('')
                        .map((_, j) => ({
                            key: `${i}.${j}`,
                            selected: false,
                            text: `Вещь - ${j+1}`,
                        })),
                ],
            }))
    );
    const userInfo = useSelector(state => state.userReducer.userInfo);

    useEffect(() => {
        firebase.database().ref(`/users${userInfo.uid}/travels`).on('value', async (snap)=>{
            const resp = snap.val();
            let citiesData = [];
            let i = 0;
            for (let key in resp){
                citiesData[i] = {
                    uid: key,
                    city: resp[key].city,
                    dateTravel: resp[key].dateTravel,
                    typeTravel: resp[key].typeTravel,
                }
                i++;
            }
            setTravelsList(citiesData);
            setActiveCityNumber(citiesData.length-1)
            const data = await getWeather(citiesData[citiesData.length - 1]?.city);
            setWeatherInfo(data);
        });
        return () => {};
    }, [firebase])

    const changeTravel = async (uid) => {
        setIsDisabledScreen(true);
        let index = travelsList.findIndex(item => item.uid === uid)
        setActiveCityNumber(index)
        const data = await getWeather(travelsList[index]?.city);
        setWeatherInfo(data);
        setIsDisabledScreen(false);
    }

    const deleteTravel = (uid) => {
        setIsDisabledScreen(true);
        console.log(`/users${userInfo.uid}/travels${uid}`)
        firebase.database().ref(`/users${userInfo.uid}/travels/${uid}`).remove().then(() => {
            setIsDisabledScreen(false);
        })
    }

    //list`s functions
    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    };

    const deleteRow = (rowMap, rowKey) => {
        closeRow(rowMap, rowKey);
        const [section] = rowKey.split('.');
        const newData = [...listData];
        const prevIndex = listData[section].data.findIndex(
            item => item.key === rowKey
        );
        newData[section].data.splice(prevIndex, 1);
        setListData(newData);
    };

    const onRowDidOpen = rowKey => {
        console.log('This row opened', rowKey);
    };

    const pressItem = (id) => {
        const newData = [...listData];
        newData.map((item) => (
            item.data.find(its => {
                if(its.key === id){
                    if(its.selected != true){
                        return its.selected = true;
                    } else {
                        return its.selected = false;
                    }
                }
            })
        ));
        setListData(newData);
    } 

    const renderItem = (data) => (
        <TouchableHighlight
            onPress={() => pressItem(data.item.key)}
            style={[styles.rowFront, data.item.selected && styles.rowFrontChecked]}
            underlayColor={dark}
        >
            <View style={styles.rowContent}>
                <MaterialCommunityIcons 
                    name={data.item.selected ? "checkbox-intermediate" : "checkbox-blank-outline"} 
                    size={30} 
                    color={grey} 
                    style={styles.checkbox}
                />
                <Text style={styles.rowText}>{data.item.text}</Text>
            </View>
        </TouchableHighlight>
    );

    const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
            <TouchableOpacity
                disabled={isDisabledScreen}
                style={[styles.backRightBtn, styles.backRightBtnLeft]}
                onPress={() => closeRow(rowMap, data.item.key)}
                activeOpacity={0.7}
            >
                <Text style={styles.backTextWhite}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
                disabled={isDisabledScreen} 
                style={[styles.backRightBtn, styles.backRightBtnRight]}
                onPress={() => deleteRow(rowMap, data.item.key)}
                activeOpacity={0.7}
            >
                <AntDesign name="delete" size={24} color={warning} />
            </TouchableOpacity>
        </View>
    );

    const renderSectionHeader = ({ section }) => <Text style={styles.title}>{section.title}</Text>;

    return (
        <>
        {!travelsList.length ?
            <View style={{flex: 1, justifyContent: 'center'}}>
                <Button
                    onPress={navigation => navigation.navigate('СreateTravel')}
                >add new travel</Button>
            </View>
        :
            <View style={{flex: 1}}>
                <View style={styles.cityBlock}>
                    <View style={styles.city}>
                        <Text style={styles.cityText}>
                            {travelsList[activeCityNumber]?.city}
                        </Text>
                        <TouchableOpacity disabled={isDisabledScreen} onPress={() => deleteTravel(travelsList[activeCityNumber]?.uid)}>
                            <MaterialCommunityIcons name="delete-forever" size={33} color={warning} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.weather}>
                        {moment(new Date(travelsList[activeCityNumber]?.dateTravel)).format('MMMM/DD/YYYY')}
                    </Text>
                    <Text style={styles.weather}>
                        Погода: {weatherInfo?.main?.temp?.toFixed(1)}℃,&nbsp;
                        {weatherInfo?.weather && weatherInfo?.weather[0]?.description}
                    </Text>
                    <Text style={styles.weather}>
                        Ощущается: {weatherInfo && weatherInfo?.main?.feels_like?.toFixed(1)}℃
                    </Text>
                    <ScrollView horizontal style={styles.arr}>
                        {travelsList.map((item, index) => (
                            <TouchableOpacity disabled={isDisabledScreen} key={index} style={styles.itemChanger} onPress={() => {changeTravel(item.uid)}}>
                                <Text>{item.city}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <SwipeListView
                    recalculateHiddenLayout={true}
                    disableRightSwipe
                    useSectionList
                    sections={listData}
                    renderItem={renderItem}
                    renderHiddenItem={renderHiddenItem}
                    renderSectionHeader={renderSectionHeader}
                    rightOpenValue={-150}
                    previewRowKey={'0'}
                    previewOpenValue={-40}
                    previewOpenDelay={3000}
                    onRowDidOpen={onRowDidOpen}
                />
            </View>
        }
        </>
    );
}

export default TravelListScreen;


// STYLES
const {grey, black, white, lightBlack, dark, warning} = colorConstants;
const styles = StyleSheet.create({
    itemChanger: {
        padding: 3,
        margin: 2,
        marginHorizontal: 5,
        backgroundColor: grey,
        borderRadius: 3,
    },
    arr:{
        flexDirection: 'row',
        marginVertical: 5,
    },
    cityBlock:{
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 5,
        borderBottomColor: black,
        borderBottomWidth: 1,
    },
    city:{
        flexDirection: 'row',
        alignItems: "baseline",
    },
    cityText:{
        color: white,
        fontSize: 30,
    },
    weather:{
        color: white,
        fontSize: 11,
    },
    backTextWhite: {
        color: white,
    },
    title:{
        color: white,
        paddingLeft: 15,
        fontSize: 20,
        marginTop: 10,
        borderBottomColor: grey,
        borderBottomWidth: 1,
        paddingBottom: 5,

    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: lightBlack,
        borderBottomColor: black,
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 65,
    },
    rowFrontChecked:{
        backgroundColor: dark,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingLeft: 15,
        paddingRight: 7,
    },
    checkbox:{ 
        marginRight: 10,
    },
    rowText:{
        color: grey,

    },
    rowBack: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    backRightBtn: {
        bottom: 0,
        justifyContent: 'center',
        position: 'relative',
        top: 0,
        width: 75,
    },
    backRightBtnLeft: {
        width: '100%',
        backgroundColor: dark,
        alignItems: 'flex-end',
        paddingRight: 15,
        position: 'relative',
    },
    backRightBtnRight: {
        backgroundColor: dark,
        alignItems: 'center',
        position: 'relative',
    },
});

