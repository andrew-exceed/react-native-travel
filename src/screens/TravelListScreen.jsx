import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    View,
    Modal,
    SectionList,
    ScrollView,
    TouchableOpacityBase,
} from 'react-native';
import { Button,InputItem } from '@ant-design/react-native';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colorConstants from '../mainStyles/colorConstants';
import * as firebase from 'firebase';
import moment from 'moment-timezone'
import getWeather from '../api/weatherService';
import { 
    useSelector,
} from 'react-redux';

export const TravelListScreen = ({ navigation }) => {
    const [ weatherInfo, setWeatherInfo ] = useState({});
    const [ travelsList, setTravelsList ] = useState([1]);
    const [ isDisabledScreen, setIsDisabledScreen ] = useState(false);
    const [ modalVisible, setModalVisible ] = useState(false);
    const [ listData, setListData ] = useState([]);
    const [ newItem, setNewItem ] = useState('');
    const [ activeSection, setActiveSection ] = useState('');
    const [ customModal, setCustomModal ] = useState(false);
    const [ listSets, setListsSets ] = useState([]);
    const userInfo = useSelector(state => state.userReducer.userInfo);

    useEffect(() => {
        let cleanupFunction = false;
        const fetchData = async () => {
            firebase.database().ref(`/users${userInfo.uid}/travels`).on('value', async (snap) => {
                const resp = snap.val();
                let citiesData = [];
                let i = 0;
                for (let key in resp){
                    resp[key]?.data.map((item) => {
                        !item?.data && (item.data = [])
                    });
                    citiesData[i] = {
                        uid: key,
                        city: resp[key]?.city,
                        dateTravel: resp[key]?.dateTravel,
                        typeTravel: resp[key]?.typeTravel,
                        data: resp[key]?.data,
                    }
                    i++;
                }
                
                    setTravelsList(citiesData);
                    const data = await getWeather(citiesData[0]?.city);
                    setWeatherInfo(data);
                    setListData(citiesData[0]?.data)
            });
        }
        if(!cleanupFunction){
            fetchData();
        }
        return () => cleanupFunction = true;
    }, [firebase])

    const handleDeleteTravel = (uid) => {
        setIsDisabledScreen(true);
        firebase.database().ref(`/users${userInfo.uid}/travels/${uid}`)
        .remove().then(() => {
            setIsDisabledScreen(false);
        })
    }
    const handleDeleteItem = async (data) => {
        setIsDisabledScreen(true);
        let resp = [...data?.section?.data]
        resp.splice(data.index, 1);
        await firebase.database()
        .ref(`/users${userInfo.uid}/travels/${travelsList[0]?.uid}/data/${data?.section?.id}/data/`)
        .set(resp);
        setIsDisabledScreen(false);
    };

    const openModal = (section) => {
        setModalVisible(true);
        setActiveSection(section);
    }

    const handleClickCloseModal = () => {
        setCustomModal(false);
        setModalVisible(false);
    }

    const handleAddNewItem = async () => {
        if(!newItem){return null}
        setIsDisabledScreen(true);
        let newArray = activeSection?.data;
        newArray.push({
            text: newItem,
            selected: false,
        })
        await firebase.database()
        .ref(`/users${userInfo.uid}/travels/${travelsList[0]?.uid}/data/${activeSection.id}/data/`)
        .set(newArray)
        setModalVisible(!modalVisible);
        setNewItem('');
        setIsDisabledScreen(false);
    }

    const handlePressItem = (item) => {
        firebase.database()
        .ref(`/users${userInfo.uid}/travels/${travelsList[0]?.uid}/data/${item?.section?.id}/data/${item?.index}`)
        .update({selected: !item?.item?.selected})
    } 

    const handleDeleteSection = async (section) => {
        setIsDisabledScreen(true);
        let newList = [...listData];
        newList.splice(section.id, 1);
        newList.map((_, index) => {newList[index].id = index})
        await firebase.database()
        .ref(`/users${userInfo.uid}/travels/${travelsList[0]?.uid}/data/`)
        .set(newList);
        setIsDisabledScreen(false);
    }

    const handleClickAddSetToTravel = async (item) => {
        let newListData = [...listData]
        newListData.push(item);
        newListData.map((_, index) => {
            newListData[index].id = index;
        })
        await firebase.database()
        .ref(`/users${userInfo.uid}/travels/${travelsList[0]?.uid}/data/`)
        .set(newListData);
        setCustomModal(false);
        setModalVisible(false);
    }

    const handleClickDelUsersSet = async (item) => {
        let setsList = [];
        let i = 0;
        await firebase.database()
        .ref(`/users${userInfo.uid}/selfSets/${item.uid}`).remove().then(
            await firebase.database()
            .ref(`/users${userInfo.uid}/selfSets/`).on('value', async (snap) => {
                const resp = await snap?.val();
                for (let key in resp){
                    setsList[i] = {
                        uid: key,
                        title: resp[key].title,
                        data: resp[key]?.data,
                    }
                    i++;
                }
                setListsSets(setsList);
            })
        )
    }

    const handleAddNewSetClick = async () => {
        let setsList = [];
        let i = 0;
        setCustomModal(true);
        setModalVisible(true);
        await firebase.database()
        .ref(`/users${userInfo.uid}/selfSets/`).on('value', (snap) => {
            const resp = snap.val();
            for (let key in resp){
                setsList[i] = {
                    uid: key,
                    title: resp[key].title,
                    data: resp[key]?.data,
                }
                i++;
            }
            setListsSets(setsList);
        });
    }

    const handleClickEditSet = (item) => {
        setCustomModal(false);
        setModalVisible(false);
        navigation.navigate('CreateSet', {
            item: item,
        });
    }
    
    const UsersSetList = () => (
        <ScrollView style={styles.modalScroll}>
            {!listSets.length ?
                <Text>nooo</Text> :
                listSets.map((item, index) => (
                    <View key={index} style={styles.addSet}>
                        <TouchableOpacity
                            style={styles.allWidth}
                            onPress={() => {handleClickAddSetToTravel(item)}} 
                        >
                            <Text style={styles.addSetText}>{item.title}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.editSetIcon}
                            onPress={() => {handleClickEditSet(item)}}
                        >
                            <MaterialCommunityIcons
                                name="circle-edit-outline"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {handleClickDelUsersSet(item)}} >
                            <MaterialCommunityIcons
                                name="sword-cross"
                                size={24}
                                color={warning}
                            />
                        </TouchableOpacity>
                    </View>
                )) 
            }
        </ScrollView>
    )

    const renderItem = (data) => (
        <TouchableHighlight
            onPress={() => handlePressItem(data)}
            style={[styles.rowFront, data?.item?.selected && styles.rowFrontChecked]}
            underlayColor={dark}
        >
            <View style={styles.rowContent}>
                <MaterialCommunityIcons 
                    name={data?.item?.selected ? "checkbox-intermediate" : "checkbox-blank-outline"} 
                    size={30} 
                    color={grey} 
                    style={styles.checkbox}
                />
                <Text style={styles.rowText}>{data?.item?.text}</Text>
                <TouchableOpacity
                    disabled={isDisabledScreen} 
                    style={styles.deleteRow}
                    onPress={() => handleDeleteItem(data)}
                    activeOpacity={0.7}
                >
                    <AntDesign name="delete" size={24} color={warning} />
                </TouchableOpacity>
            </View>
        </TouchableHighlight>
    );

    const renderSectionHeader = ({ section }) => (
        <View style={styles.titleContainer}>
            <Text style={styles.title}>{section.title}</Text>
            <View style={[styles.actionsSectionBtns, (listData.length === 1) && {justifyContent: 'flex-end'}]}>
                <TouchableOpacity
                    onPress={() => {openModal(section)}}
                >
                    <MaterialCommunityIcons name="plus-box-outline" size={25} color={white} />
                </TouchableOpacity>
                {listData.length > 1 && 
                    <TouchableOpacity
                        onPress={() => {handleDeleteSection(section)}}
                    >
                        <MaterialCommunityIcons name="delete-forever" size={24} color={warning} />
                    </TouchableOpacity>
                }
            </View>
        </View>);

    return (
        <View style={styles.centeredView}>
            {!travelsList?.length ?
                <View style={{flex: 1, justifyContent: 'center'}}>
                    <Button
                        onPress={() => navigation.navigate('СreateTravel')}
                    >add new travel</Button>
                </View>
            :
                <View style={{flex: 1}}>
                    
                    <View style={styles.cityBlock}>
                        <View style={styles.city}>
                            <Text style={styles.cityText}>
                                {travelsList?.length && travelsList[0]?.city}
                            </Text>
                            <TouchableOpacity
                                disabled={isDisabledScreen}
                                onPress={() => handleDeleteTravel(travelsList.length && travelsList[0]?.uid)}
                            >
                                <MaterialCommunityIcons name="delete-forever" size={33} color={warning} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.weather}>
                            {moment(new Date(travelsList[0]?.dateTravel)).format('MMMM/DD/YYYY')}
                        </Text>
                        <Text style={styles.weather}>
                            Погода: {weatherInfo?.main?.temp?.toFixed(1)}℃,&nbsp;
                            {weatherInfo?.weather && weatherInfo?.weather[0]?.description}
                        </Text>
                        <Text style={styles.weather}>
                            Ощущается: {weatherInfo && weatherInfo?.main?.feels_like?.toFixed(1)}℃
                        </Text>
                    </View>
                    <View style={[styles.boxContainer, styles.rowPosition]}>
                        <Button style={styles.flexHalf} onPress={() => handleAddNewSetClick()}>Add set</Button>
                        <Button style={styles.flexHalf} onPress={() => navigation.navigate('CreateSet')}>Collect new set</Button>
                    </View>
                    <SectionList 
                        sections={listData}
                        renderItem={renderItem}
                        renderSectionHeader={renderSectionHeader}
                        keyExtractor={(_, i) => i}
                    />
                </View>
            }
            <Modal
                transparent={true}
                visible={modalVisible}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                        <TouchableOpacity style={styles.closeModal} onPress={() => handleClickCloseModal()} >
                            <MaterialCommunityIcons name="sword-cross" size={24} color="black" />
                        </TouchableOpacity>
                        {customModal ? <UsersSetList /> :
                            <>
                                <Text style={styles.modalText}>add new item</Text>
                                <InputItem
                                    value={newItem}
                                    onChange={value => {setNewItem(value)}}
                                    placeholder="new item"
                                ></InputItem>
                                <TouchableHighlight
                                    disabled={isDisabledScreen}
                                    style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                                    onPress={() => {
                                        handleAddNewItem();
                                    }}
                                >
                                    <Text style={styles.textStyle}>Add</Text>
                                </TouchableHighlight>
                            </>
                        }   
                        </View>
                    </View>
            </Modal>
        </View>
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
    flexHalf: {
        flex: .5,
    },
    arr:{
        flexDirection: 'row',
        marginVertical: 5,
    },
    closeModal: {
        position: "absolute",
        right: 10,
        top: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cityBlock:{
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 5,
        borderBottomColor: black,
        borderBottomWidth: 1,
    },
    rowPosition: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
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
    titleContainer: {
        paddingLeft: 15,
        marginTop: 10,
        borderBottomColor: grey,
        borderBottomWidth: 1,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 15,
    },
    title:{
        color: white,
        fontSize: 20,
    },
    actionsSectionBtns: {
        flexDirection: "row",
        width: 70,
        justifyContent: 'space-between'
    },
    deleteRow: {
        padding: 10,
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
        flex: 1
    },
    rowBack: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    modalView: {
        position: 'relative',
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    openButton: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
    },
    addSetText: {
        fontSize: 14
    },
    allWidth: {
        flex: 1
    },
    editSetIcon: {
        marginRight: 10,
    },
    addSet: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: grey,
        height: 25,
        marginVertical: 3,
    },
    modalScroll: {
        width: '100%'
    }
});

