import React, { useState, useEffect } from 'react'
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as firebase from 'firebase';
import { Button,InputItem } from '@ant-design/react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
    useSelector,
} from 'react-redux';

import colorConstants from '../mainStyles/colorConstants'
const {grey, black, white, lightBlack, dark, warning} = colorConstants;

export const CreateSetScreen = ({ route }) => {
    const { item } = route.params;
    const [ collectionName, setCollectionName ] = useState('');
    const [ inputList, setInputList ] = useState([""]);
    const [ collectionUidForEdit, setCollectionUidForEdit]  = useState(null);
    const userInfo = useSelector(state => state.userReducer.userInfo);

    useEffect(() => {
        if(item){
            let editableArr = [...item.data];
            editableArr.map((item, index) => (
                editableArr[index] = item.text
            ));
            setInputList(editableArr);
            setCollectionUidForEdit(item.uid);
            setCollectionName(item.title);
        } else {
            setInputList(['']);
            setCollectionUidForEdit(null);
            setCollectionName('');
        }
    }, []);

    const handleAddClick = () => {
        setInputList([...inputList, ""]);
    };

    const handleRemoveClick = index => {
        const list = [...inputList];
        list.splice(index, 1);
        setInputList(list);
    };

    const handleInputChange = (value, index) => {
        const list = [...inputList];
        list[index] = value;
        setInputList(list);
    };

    const handleSendClick = () => {
        if(!collectionName || !inputList[0]){return null}
        collectionUidForEdit ? editSet() : addNewSet();
    }

    const addNewSet = async () => {
        let newList = [...inputList]
        newList.map((item, i) => {
            newList[i] = {
                text: item,
                selected: false,
            }
        })
        await firebase.database()
        .ref(`/users${userInfo.uid}/selfSets`).push({
            title: collectionName,
            data: newList
        })
        setInputList(['']);
        setCollectionName('');
        setCollectionUidForEdit(null);
    }

    const editSet = async () => {
        let newList = [...inputList]
        newList.map((item, i) => {
            newList[i] = {
                text: item,
                selected: false,
            }
        })
        await firebase.database()
        .ref(`/users${userInfo.uid}/selfSets/${collectionUidForEdit}`).set({
            title: collectionName,
            data: newList
        })
        setInputList(['']);
        setCollectionName('');
        setCollectionUidForEdit(null);
    }

    return(
        <View style={styles.container}>
            <Text>{collectionUidForEdit}</Text>
            <View style={styles.row}>
                <InputItem 
                    value={collectionName}
                    onChange={value => setCollectionName(value)}
                    style={[styles.inputs, styles.main]}
                    placeholder='set name'
                    placeholderTextColor={grey}
                />
            </View>
            <View style={styles.row}>
                {inputList.map((item, index) => (
                    <InputItem
                        value={item}
                        key={index}
                        onChange={value => handleInputChange(value, index)}
                        style={[styles.inputs, styles.main]}
                        placeholder='item'
                        placeholderTextColor={grey}
                        extra={inputList.length !== 1 && <MaterialCommunityIcons name="sword-cross" size={24} color={warning} />}
                        onExtraClick={() => handleRemoveClick(index)}
                    />
                ))}
                <Button onPress={() => handleAddClick()}>Add Item</Button>
                <Button onPress={() => handleSendClick()}>Ok</Button>
            </View>
        </View>
    )
}

export default CreateSetScreen;


//styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: "flex-start",
    },
    inputs: {
        width: '100%',
        color: white,
    },
    row: {
        marginBottom: 10,
    }
})